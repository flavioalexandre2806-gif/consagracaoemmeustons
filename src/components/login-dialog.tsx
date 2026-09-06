import { useState, type FormEvent } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { runAction, useCatalog } from "@/components/catalog-provider";

export function LoginDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { login } = useCatalog();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setPending(true);
    const ok = await runAction(
      () => login(username, password),
      "Área restrita liberada.",
    );
    setPending(false);
    if (ok) {
      setPassword("");
      onOpenChange(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        title="Área restrita"
        description="Somente o administrador pode adicionar ou editar cânticos e eventos."
      >
        <form onSubmit={onSubmit} className="space-y-4">
          <Field label="Usuário" htmlFor="admin-user">
            <Input
              id="admin-user"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </Field>
          <Field label="Senha" htmlFor="admin-pass">
            <Input
              id="admin-pass"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </Field>
          <div className="flex justify-end pt-2">
            <Button type="submit" disabled={pending}>
              {pending ? "Entrando…" : "Entrar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
