/**
 * Consagração em Meus Tons — catálogo litúrgico em JavaScript puro.
 *
 * Como os dados são guardados
 *  - localStorage (chave abaixo) no navegador de quem está usando.
 *  - catalog.json no mesmo pasta: é o que o público vê no GitHub Pages
 *    quando ainda não há cópia local. Depois de editar, use «Baixar JSON»
 *    e substitua catalog.json no repositório para publicar o acervo.
 *
 * Administração: botão Entrar. Visitantes só leem.
 */
(function () {
  "use strict";

  var STORAGE_KEY = "consagracao-em-meus-tons";
  var ADMIN_KEY = "consagracao-admin";
  var ADMIN_USER = "flavio";
  var ADMIN_PASS = "consagracao";

  var MISSA = [
    { id: "entrada", label: "Entrada e Louvor" },
    { id: "penitencial", label: "Ato Penitencial" },
    { id: "gloria", label: "Glória" },
    { id: "salmo", label: "Salmo" },
    { id: "aclamacao", label: "Aclamação" },
    { id: "ofertorio", label: "Ofertório" },
    { id: "santo", label: "Santo" },
    { id: "cordeiro", label: "Cordeiro" },
    { id: "comunhao", label: "Comunhão" },
    { id: "final", label: "Final" },
  ];
  var ESPECIAIS = [
    { id: "espirito", label: "Espírito Santo" },
    { id: "adoracao", label: "Adoração" },
    { id: "reflexao", label: "Reflexão" },
    { id: "senhora", label: "Nossa Senhora" },
  ];
  var CASAMENTO = [
    { id: "entrada-noivo", label: "Entrada do Noivo" },
    { id: "entrada-noiva", label: "Entrada da Noiva" },
    { id: "aliancas", label: "Alianças" },
    { id: "assinatura", label: "Assinatura" },
    { id: "saida-noivos", label: "Saída dos Noivos" },
  ];
  var CATALOG = MISSA.concat(ESPECIAIS);
  var SLOTS = CATALOG.concat(CASAMENTO);
  var WEEKDAYS = ["domingo", "segunda-feira", "terça-feira", "quarta-feira", "quinta-feira", "sexta-feira", "sábado"];
  var MONTHS = [
    "janeiro", "fevereiro", "março", "abril", "maio", "junho",
    "julho", "agosto", "setembro", "outubro", "novembro", "dezembro",
  ];
  var DOW = ["D", "S", "T", "Q", "Q", "S", "S"];

  var root = document.getElementById("app");
  var now = new Date();
  var state = {
    view: "catalog",
    section: "entrada",
    songs: [],
    events: [],
    admin: false,
    year: now.getFullYear(),
    month: now.getMonth(),
    selectedDay: now.getDate(),
    selectedMonth: now.getMonth(),
    selectedYear: now.getFullYear(),
    modal: null,
    songDraft: null,
    eventDraft: null,
    error: "",
    playlistPick: { category: "entrada", songId: "" },
  };

  function uid() {
    return crypto.randomUUID();
  }

  function esc(value) {
    return String(value)
      .replace(/&/g, "&")
      .replace(/</g, "<")
      .replace(/>/g, ">")
      .replace(/"/g, """);
  }

  function sectionLabel(id) {
    var found = SLOTS.find(function (s) { return s.id === id; });
    return found ? found.label : id;
  }

  function sortSongs(list) {
    return list.slice().sort(function (a, b) {
      return a.title.localeCompare(b.title, "pt-BR", { sensitivity: "base" });
    });
  }

  function normalizePdfUrl(raw) {
    var text = String(raw || "").trim();
    if (!text) return { ok: false, error: "Informe o link do PDF." };
    var parsed;
    try {
      parsed = new URL(text);
    } catch (e) {
      return { ok: false, error: "Este link não é uma URL válida." };
    }
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return { ok: false, error: "O link precisa começar com https://" };
    }
    var file = parsed.pathname.match(/\/file\/d\/([^/]+)/);
    if (file) {
      return { ok: true, url: "https://drive.google.com/file/d/" + file[1] + "/view" };
    }
    var docs = parsed.pathname.match(/\/d\/([^/]+)/);
    if (parsed.hostname.indexOf("google.com") !== -1 && docs) {
      return { ok: true, url: "https://drive.google.com/file/d/" + docs[1] + "/view" };
    }
    var id = parsed.searchParams.get("id");
    if (parsed.hostname.indexOf("drive.google.com") !== -1 && id) {
      return { ok: true, url: "https://drive.google.com/file/d/" + id + "/view" };
    }
    return { ok: true, url: parsed.href };
  }

  function numberedPlaylist(items) {
    var totals = {};
    items.forEach(function (item) {
      totals[item.category] = (totals[item.category] || 0) + 1;
    });
    var seen = {};
    return items.map(function (item) {
      seen[item.category] = (seen[item.category] || 0) + 1;
      var base = sectionLabel(item.category);
      var label = totals[item.category] > 1 ? base + " " + seen[item.category] : base;
      return { category: item.category, songId: item.songId, label: label };
    });
  }

  function persist() {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ songs: state.songs, events: state.events }),
    );
  }

  function loadLocal() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      var data = JSON.parse(raw);
      return {
        songs: Array.isArray(data.songs) ? data.songs : [],
        events: Array.isArray(data.events) ? data.events : [],
      };
    } catch (e) {
      return null;
    }
  }

  function monthTitle(year, month) {
    var name = MONTHS[month] || "";
    return name.charAt(0).toUpperCase() + name.slice(1) + " de " + year;
  }

  function formatWhen(iso) {
    var date = new Date(iso);
    if (isNaN(date.getTime())) return iso;
    var weekday = WEEKDAYS[date.getDay()];
    var hours = String(date.getHours()).padStart(2, "0");
    var minutes = String(date.getMinutes()).padStart(2, "0");
    return (
      weekday +
      ", " +
      date.getDate() +
      " de " +
      MONTHS[date.getMonth()] +
      " de " +
      date.getFullYear() +
      " · " +
      hours +
      "h" +
      minutes
    );
  }

  function sameDay(iso, year, month, day) {
    var date = new Date(iso);
    return date.getFullYear() === year && date.getMonth() === month && date.getDate() === day;
  }

  function calendarCells(year, month) {
    var first = new Date(year, month, 1);
    var start = first.getDay();
    var days = new Date(year, month + 1, 0).getDate();
    var prevDays = new Date(year, month, 0).getDate();
    var cells = [];
    var i;
    for (i = start - 1; i >= 0; i--) {
      var dt = new Date(year, month, 1 - (i + 1));
      cells.push({ day: prevDays - i, month: dt.getMonth(), year: dt.getFullYear(), muted: true });
    }
    for (i = 1; i <= days; i++) {
      cells.push({ day: i, month: month, year: year, muted: false });
    }
    var extra = 1;
    while (cells.length % 7 !== 0) {
      var next = new Date(year, month + 1, extra++);
      cells.push({
        day: next.getDate(),
        month: next.getMonth(),
        year: next.getFullYear(),
        muted: true,
      });
    }
    return cells;
  }

  function options(list, selected) {
    return list
      .map(function (item) {
        return (
          '<option value="' +
          esc(item.id) +
          '"' +
          (item.id === selected ? " selected" : "") +
          ">" +
          esc(item.label) +
          "</option>"
        );
      })
      .join("");
  }

  function renderNav() {
    var missaBtns = MISSA.map(function (s) {
      return (
        '<button type="button" data-section="' +
        s.id +
        '" class="' +
        (state.section === s.id ? "active" : "") +
        '">' +
        esc(s.label) +
        "</button>"
      );
    }).join("");
    var specBtns = ESPECIAIS.map(function (s) {
      return (
        '<button type="button" data-section="' +
        s.id +
        '" class="' +
        (state.section === s.id ? "active" : "") +
        '">' +
        esc(s.label) +
        "</button>"
      );
    }).join("");
    return (
      '<aside>' +
      '<p class="aside-label">Missa</p>' +
      '<div class="nav-list">' +
      missaBtns +
      "</div>" +
      '<p class="aside-label" style="margin-top:1.1rem">Cânticos especiais</p>' +
      '<div class="nav-list">' +
      specBtns +
      "</div>" +
      '<label class="field mobile-select" style="margin-top:0.4rem">' +
      "<span>Seção</span>" +
      '<select id="mobile-section">' +
      '<optgroup label="Missa">' +
      options(MISSA, state.section) +
      "</optgroup>" +
      '<optgroup label="Cânticos especiais">' +
      options(ESPECIAIS, state.section) +
      "</optgroup>" +
      "</select>" +
      "</label>" +
      "</aside>"
    );
  }

  function renderSongs() {
    var songs = sortSongs(
      state.songs.filter(function (s) {
        return s.category === state.section;
      }),
    );
    var rows;
    if (!songs.length) {
      rows =
        '<div class="empty">' +
        "Nenhum cântico nesta seção." +
        (state.admin
          ? "<small>Toque + para cadastrar o primeiro.</small>"
          : "<small>O catálogo ainda está sendo preenchido.</small>") +
        "</div>";
    } else {
      rows =
        '<ul class="songs">' +
        songs
          .map(function (song) {
            var adminBtns = state.admin
              ? '<button type="button" class="btn icon" data-edit-song="' +
                esc(song.id) +
                '" aria-label="Editar">✎</button>' +
                '<button type="button" class="btn icon" data-del-song="' +
                esc(song.id) +
                '" aria-label="Excluir">✕</button>'
              : "";
            return (
              "<li>" +
              '<div class="title">' +
              "<p>" +
              esc(song.title) +
              "</p>" +
              (song.pdfUrl
                ? '<a class="pdf" href="' +
                  esc(song.pdfUrl) +
                  '" target="_blank" rel="noopener noreferrer">Abrir PDF</a>'
                : "") +
              "</div>" +
              adminBtns +
              "</li>"
            );
          })
          .join("") +
        "</ul>";
    }
    var add = state.admin
      ? '<div class="add-row"><button type="button" class="btn plus" id="add-song" aria-label="Novo cântico">+</button></div>'
      : "";
    return (
      '<section class="panel">' +
      '<p class="kicker">' +
      (ESPECIAIS.some(function (s) {
        return s.id === state.section;
      })
        ? "Cântico especial"
        : "Missa") +
      "</p>" +
      "<h2>" +
      esc(sectionLabel(state.section)) +
      "</h2>" +
      rows +
      add +
      "</section>"
    );
  }

  function renderAgenda() {
    var cells = calendarCells(state.year, state.month);
    var grid = DOW.map(function (d) {
      return '<div class="cal-dow">' + d + "</div>";
    }).join("");
    grid += cells
      .map(function (cell) {
        var has = state.events.some(function (ev) {
          return sameDay(ev.datetime, cell.year, cell.month, cell.day);
        });
        var selected =
          cell.day === state.selectedDay &&
          cell.month === state.selectedMonth &&
          cell.year === state.selectedYear;
        var todayDate = new Date();
        var today =
          cell.day === todayDate.getDate() &&
          cell.month === todayDate.getMonth() &&
          cell.year === todayDate.getFullYear();
        var cls = "cal-cell";
        if (cell.muted) cls += " muted";
        if (today) cls += " today";
        if (selected) cls += " selected";
        return (
          '<button type="button" class="' +
          cls +
          '" data-cal="' +
          cell.year +
          "-" +
          cell.month +
          "-" +
          cell.day +
          '">' +
          cell.day +
          (has ? '<span class="dot"></span>' : "") +
          "</button>"
        );
      })
      .join("");

    var dayEvents = state.events
      .filter(function (ev) {
        return sameDay(ev.datetime, state.selectedYear, state.selectedMonth, state.selectedDay);
      })
      .sort(function (a, b) {
        return new Date(a.datetime) - new Date(b.datetime);
      });

    var cards;
    if (!dayEvents.length) {
      cards =
        '<div class="empty">Nenhum evento neste dia.' +
        (state.admin ? "<small>Crie um com Novo evento.</small>" : "") +
        "</div>";
    } else {
      cards = dayEvents
        .map(function (ev) {
          var numbered = numberedPlaylist(ev.items || []);
          var slots = numbered
            .map(function (item) {
              var song = state.songs.find(function (s) {
                return s.id === item.songId;
              });
              return (
                "<li><span class=\"slot\">" +
                esc(item.label) +
                "</span><span>" +
                esc(song ? song.title : "Cântico removido") +
                "</span></li>"
              );
            })
            .join("");
          var adminBtns = state.admin
            ? '<div class="modal-actions" style="margin-top:0.8rem;justify-content:flex-start">' +
              '<button type="button" class="btn" data-edit-event="' +
              esc(ev.id) +
              '">Editar</button>' +
              '<button type="button" class="btn danger" data-del-event="' +
              esc(ev.id) +
              '">Excluir</button>' +
              "</div>"
            : "";
          return (
            '<article class="event-card">' +
            "<h4>" +
            esc(ev.name) +
            "</h4>" +
            '<p class="meta">' +
            esc(formatWhen(ev.datetime)) +
            (ev.location ? " · " + esc(ev.location) : "") +
            "</p>" +
            (slots ? '<ul class="slot-list">' + slots + "</ul>" : "") +
            adminBtns +
            "</article>"
          );
        })
        .join("");
    }

    var newBtn = state.admin
      ? '<button type="button" class="btn primary" id="add-event">Novo evento</button>'
      : "";

    return (
      '<div class="cal-wrap">' +
      '<div class="cal-box">' +
      '<div class="cal-head">' +
      '<button type="button" class="btn icon" id="cal-prev" aria-label="Mês anterior">‹</button>' +
      "<h3>" +
      esc(monthTitle(state.year, state.month)) +
      "</h3>" +
      '<button type="button" class="btn icon" id="cal-next" aria-label="Próximo mês">›</button>' +
      "</div>" +
      '<div class="cal-grid">' +
      grid +
      "</div>" +
      "</div>" +
      "<div>" +
      '<div style="display:flex;justify-content:space-between;align-items:center;gap:0.75rem;margin-bottom:1rem">' +
      "<h2 style=\"font-size:1.5rem\">Agenda</h2>" +
      newBtn +
      "</div>" +
      cards +
      "</div>" +
      "</div>"
    );
  }

  function renderModal() {
    if (!state.modal) return "";
    if (state.modal === "login") {
      return (
        '<div class="overlay open" id="overlay">' +
        '<form class="modal" id="login-form">' +
        "<h2>Entrar</h2>" +
        '<p class="desc">Área de quem cuida do catálogo. Visitantes continuam só lendo.</p>' +
        '<div class="stack">' +
        '<label class="field"><span>Usuário</span><input name="user" autocomplete="username" required></label>' +
        '<label class="field"><span>Senha</span><input name="pass" type="password" autocomplete="current-password" required></label>' +
        (state.error ? '<p class="err">' + esc(state.error) + "</p>" : "") +
        "</div>" +
        '<div class="modal-actions">' +
        '<button type="button" class="btn ghost" data-close>Cancelar</button>' +
        '<button type="submit" class="btn primary">Entrar</button>' +
        "</div>" +
        "</form>" +
        "</div>"
      );
    }
    if (state.modal === "song") {
      var draft = state.songDraft || { title: "", pdfUrl: "", category: state.section };
      return (
        '<div class="overlay open" id="overlay">' +
        '<form class="modal" id="song-form">' +
        "<h2>" +
        (draft.id ? "Editar cântico" : "Novo cântico") +
        "</h2>" +
        '<p class="desc">Cole o link de compartilhamento do PDF no Google Drive.</p>' +
        '<div class="stack">' +
        '<label class="field"><span>Título</span><input name="title" required value="' +
        esc(draft.title || "") +
        '"></label>' +
        '<label class="field"><span>Seção</span><select name="category">' +
        '<optgroup label="Missa">' +
        options(MISSA, draft.category) +
        "</optgroup>" +
        '<optgroup label="Cânticos especiais">' +
        options(ESPECIAIS, draft.category) +
        "</optgroup>" +
        "</select></label>" +
        '<label class="field"><span>Link do PDF</span><input name="pdf" placeholder="https://drive.google.com/..." value="' +
        esc(draft.pdfUrl || "") +
        '"></label>' +
        (state.error ? '<p class="err">' + esc(state.error) + "</p>" : "") +
        "</div>" +
        '<div class="modal-actions">' +
        '<button type="button" class="btn ghost" data-close>Cancelar</button>' +
        '<button type="submit" class="btn primary">Salvar</button>' +
        "</div>" +
        "</form>" +
        "</div>"
      );
    }
    if (state.modal === "event") {
      var ev = state.eventDraft || {
        name: "",
        datetime: "",
        location: "",
        items: [],
      };
      var numbered = numberedPlaylist(ev.items || []);
      var songOptions = sortSongs(state.songs)
        .map(function (s) {
          return (
            '<option value="' +
            esc(s.id) +
            '">' +
            esc(s.title) +
            " — " +
            esc(sectionLabel(s.category)) +
            "</option>"
          );
        })
        .join("");
      var picked = numbered
        .map(function (item, idx) {
          var song = state.songs.find(function (s) {
            return s.id === item.songId;
          });
          return (
            "<li>" +
            '<span class="idx">' +
            (idx + 1) +
            "</span>" +
            "<span style=\"flex:1;min-width:0\">" +
            esc(item.label) +
            " — " +
            esc(song ? song.title : "Cântico removido") +
            "</span>" +
            '<button type="button" class="btn icon" data-drop-item="' +
            idx +
            '" aria-label="Remover">✕</button>' +
            "</li>"
          );
        })
        .join("");
      return (
        '<div class="overlay open" id="overlay">' +
        '<form class="modal" id="event-form">' +
        "<h2>" +
        (ev.id ? "Editar evento" : "Novo evento") +
        "</h2>" +
        '<p class="desc">A ordem da lista é a ordem da celebração. Vários cânticos na mesma seção são numerados sozinhos.</p>' +
        '<div class="stack">' +
        '<label class="field"><span>Nome</span><input name="name" required value="' +
        esc(ev.name || "") +
        '"></label>' +
        '<div class="row-2">' +
        '<label class="field"><span>Data e horário</span><input name="datetime" type="datetime-local" required value="' +
        esc(ev.datetime || "") +
        '"></label>' +
        '<label class="field"><span>Local</span><input name="location" value="' +
        esc(ev.location || "") +
        '"></label>' +
        "</div>" +
        '<div class="playlist">' +
        "<p class=\"aside-label\" style=\"margin:0 0 0.6rem\">Cânticos</p>" +
        '<div class="playlist-add">' +
        "<select id=\"pick-cat\">" +
        '<optgroup label="Missa">' +
        options(MISSA, state.playlistPick.category) +
        "</optgroup>" +
        '<optgroup label="Cânticos especiais">' +
        options(ESPECIAIS, state.playlistPick.category) +
        "</optgroup>" +
        '<optgroup label="Casamento">' +
        options(CASAMENTO, state.playlistPick.category) +
        "</optgroup>" +
        "</select>" +
        '<select id="pick-song"><option value="">Escolha o cântico</option>' +
        songOptions +
        "</select>" +
        '<button type="button" class="btn" id="add-item">Adicionar</button>' +
        "</div>" +
        (picked ? '<ul class="picked">' + picked + "</ul>" : '<p class="hint">Nenhum cântico ainda.</p>') +
        "</div>" +
        (state.error ? '<p class="err">' + esc(state.error) + "</p>" : "") +
        "</div>" +
        '<div class="modal-actions">' +
        '<button type="button" class="btn ghost" data-close>Cancelar</button>' +
        '<button type="submit" class="btn primary">Salvar evento</button>' +
        "</div>" +
        "</form>" +
        "</div>"
      );
    }
    return "";
  }

  function render() {
    var adminTools = state.admin
      ? '<button type="button" class="btn ghost" id="export-json">Baixar JSON</button>' +
        '<label class="btn ghost" style="cursor:pointer">Importar JSON<input type="file" id="import-json" accept="application/json" class="hidden"></label>'
      : "";
    root.innerHTML =
      '<header class="site-header">' +
      '<div class="portrait"><img src="' +
      esc(window.PORTRAIT_SRC || "flavio.jpg") +
      '" alt="Flávio Vieira"></div>' +
      '<p class="eyebrow">Música litúrgica</p>' +
      "<h1>Consagração em Meus Tons</h1>" +
      '<p class="artist">Flávio Vieira</p>' +
      '<div class="rule"></div>' +
      "</header>" +
      '<nav class="topnav">' +
      '<button type="button" class="btn' +
      (state.view === "catalog" ? " primary" : "") +
      '" data-view="catalog">Catálogo</button>' +
      '<button type="button" class="btn' +
      (state.view === "agenda" ? " primary" : "") +
      '" data-view="agenda">Agenda</button>' +
      adminTools +
      (state.admin
        ? '<button type="button" class="btn ghost" id="logout">Sair</button>'
        : '<button type="button" class="btn ghost" id="login">Entrar</button>') +
      "</nav>" +
      '<div class="wrap layout">' +
      (state.view === "catalog" ? renderNav() + renderSongs() : '<div style="grid-column:1/-1">' + renderAgenda() + "</div>") +
      "</div>" +
      renderModal();
  }

  function closeModal() {
    state.modal = null;
    state.error = "";
    state.songDraft = null;
    state.eventDraft = null;
    render();
  }

  function onClick(event) {
    var t = event.target.closest("[data-view], [data-section], [data-close], [data-cal], [data-edit-song], [data-del-song], [data-edit-event], [data-del-event], [data-drop-item], #login, #logout, #add-song, #add-event, #cal-prev, #cal-next, #add-item, #export-json, #overlay");
    if (!t) return;

    if (t.id === "overlay" && event.target.id === "overlay") {
      closeModal();
      return;
    }
    if (t.hasAttribute("data-close")) {
      event.preventDefault();
      closeModal();
      return;
    }
    if (t.getAttribute("data-view")) {
      state.view = t.getAttribute("data-view");
      render();
      return;
    }
    if (t.getAttribute("data-section")) {
      state.section = t.getAttribute("data-section");
      render();
      return;
    }
    if (t.id === "login") {
      state.modal = "login";
      state.error = "";
      render();
      return;
    }
    if (t.id === "logout") {
      state.admin = false;
      sessionStorage.removeItem(ADMIN_KEY);
      render();
      return;
    }
    if (t.id === "add-song") {
      state.modal = "song";
      state.songDraft = { title: "", pdfUrl: "", category: state.section };
      state.error = "";
      render();
      return;
    }
    if (t.getAttribute("data-edit-song")) {
      var song = state.songs.find(function (s) {
        return s.id === t.getAttribute("data-edit-song");
      });
      if (!song) return;
      state.modal = "song";
      state.songDraft = Object.assign({}, song);
      state.error = "";
      render();
      return;
    }
    if (t.getAttribute("data-del-song")) {
      if (!confirm("Excluir este cântico?")) return;
      var sid = t.getAttribute("data-del-song");
      state.songs = state.songs.filter(function (s) {
        return s.id !== sid;
      });
      persist();
      render();
      return;
    }
    if (t.id === "add-event") {
      var y = String(state.selectedYear);
      var m = String(state.selectedMonth + 1).padStart(2, "0");
      var d = String(state.selectedDay).padStart(2, "0");
      state.modal = "event";
      state.eventDraft = {
        name: "",
        datetime: y + "-" + m + "-" + d + "T19:00",
        location: "",
        items: [],
      };
      state.playlistPick = { category: "entrada", songId: "" };
      state.error = "";
      render();
      return;
    }
    if (t.getAttribute("data-edit-event")) {
      var ev = state.events.find(function (e) {
        return e.id === t.getAttribute("data-edit-event");
      });
      if (!ev) return;
      state.modal = "event";
      state.eventDraft = JSON.parse(JSON.stringify(ev));
      state.error = "";
      render();
      return;
    }
    if (t.getAttribute("data-del-event")) {
      if (!confirm("Excluir este evento?")) return;
      var eid = t.getAttribute("data-del-event");
      state.events = state.events.filter(function (e) {
        return e.id !== eid;
      });
      persist();
      render();
      return;
    }
    if (t.getAttribute("data-cal")) {
      var parts = t.getAttribute("data-cal").split("-");
      state.selectedYear = Number(parts[0]);
      state.selectedMonth = Number(parts[1]);
      state.selectedDay = Number(parts[2]);
      state.year = state.selectedYear;
      state.month = state.selectedMonth;
      render();
      return;
    }
    if (t.id === "cal-prev") {
      if (state.month === 0) {
        state.month = 11;
        state.year -= 1;
      } else {
        state.month -= 1;
      }
      render();
      return;
    }
    if (t.id === "cal-next") {
      if (state.month === 11) {
        state.month = 0;
        state.year += 1;
      } else {
        state.month += 1;
      }
      render();
      return;
    }
    if (t.getAttribute("data-drop-item") !== null) {
      var idx = Number(t.getAttribute("data-drop-item"));
      state.eventDraft.items.splice(idx, 1);
      render();
      return;
    }
    if (t.id === "add-item") {
      var cat = document.getElementById("pick-cat").value;
      var songId = document.getElementById("pick-song").value;
      if (!songId) {
        state.error = "Escolha um cântico do catálogo.";
        render();
        return;
      }
      state.eventDraft.items.push({ category: cat, songId: songId });
      state.playlistPick.category = cat;
      state.error = "";
      render();
      return;
    }
    if (t.id === "export-json") {
      var blob = new Blob(
        [JSON.stringify({ songs: state.songs, events: state.events }, null, 2)],
        { type: "application/json" },
      );
      var url = URL.createObjectURL(blob);
      var a = document.createElement("a");
      a.href = url;
      a.download = "catalog.json";
      a.click();
      URL.revokeObjectURL(url);
    }
  }

  function onChange(event) {
    if (event.target.id === "mobile-section") {
      state.section = event.target.value;
      render();
    }
  }

  function onSubmit(event) {
    var form = event.target;
    if (form.id === "login-form") {
      event.preventDefault();
      var user = form.user.value.trim();
      var pass = form.pass.value;
      if (user === ADMIN_USER && pass === ADMIN_PASS) {
        state.admin = true;
        sessionStorage.setItem(ADMIN_KEY, "1");
        closeModal();
      } else {
        state.error = "Usuário ou senha inválidos.";
        render();
      }
      return;
    }
    if (form.id === "song-form") {
      event.preventDefault();
      var parsed = normalizePdfUrl(form.pdf.value);
      if (!parsed.ok) {
        state.error = parsed.error;
        render();
        return;
      }
      var title = form.title.value.trim();
      if (!title) {
        state.error = "Informe o título.";
        render();
        return;
      }
      var category = form.category.value;
      if (state.songDraft && state.songDraft.id) {
        state.songs = state.songs.map(function (s) {
          if (s.id !== state.songDraft.id) return s;
          return { id: s.id, title: title, category: category, pdfUrl: parsed.url };
        });
      } else {
        state.songs.push({ id: uid(), title: title, category: category, pdfUrl: parsed.url });
      }
      state.section = category;
      persist();
      closeModal();
      return;
    }
    if (form.id === "event-form") {
      event.preventDefault();
      var name = form.name.value.trim();
      var datetime = form.datetime.value;
      var location = form.location.value.trim();
      if (!name || !datetime) {
        state.error = "Nome e data são obrigatórios.";
        render();
        return;
      }
      var payload = {
        id: (state.eventDraft && state.eventDraft.id) || uid(),
        name: name,
        datetime: datetime,
        location: location,
        items: (state.eventDraft && state.eventDraft.items) || [],
      };
      var existing = state.events.findIndex(function (e) {
        return e.id === payload.id;
      });
      if (existing >= 0) state.events[existing] = payload;
      else state.events.push(payload);
      var when = new Date(datetime);
      state.selectedYear = when.getFullYear();
      state.selectedMonth = when.getMonth();
      state.selectedDay = when.getDate();
      state.year = state.selectedYear;
      state.month = state.selectedMonth;
      persist();
      closeModal();
    }
  }

  function onFile(event) {
    if (event.target.id !== "import-json") return;
    var file = event.target.files && event.target.files[0];
    if (!file) return;
    var reader = new FileReader();
    reader.onload = function () {
      try {
        var data = JSON.parse(String(reader.result));
        state.songs = Array.isArray(data.songs) ? data.songs : [];
        state.events = Array.isArray(data.events) ? data.events : [];
        persist();
        render();
      } catch (e) {
        alert("JSON inválido.");
      }
    };
    reader.readAsText(file);
  }

  root.addEventListener("click", onClick);
  root.addEventListener("change", onChange);
  root.addEventListener("submit", onSubmit);
  root.addEventListener("change", onFile);

  state.admin = sessionStorage.getItem(ADMIN_KEY) === "1";
  var local = loadLocal();
  if (local) {
    state.songs = local.songs;
    state.events = local.events;
    render();
  } else {
    fetch("catalog.json", { cache: "no-store" })
      .then(function (res) {
        return res.ok ? res.json() : { songs: [], events: [] };
      })
      .then(function (data) {
        state.songs = Array.isArray(data.songs) ? data.songs : [];
        state.events = Array.isArray(data.events) ? data.events : [];
        render();
      })
      .catch(function () {
        render();
      });
  }
})();
