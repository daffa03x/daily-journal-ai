import { logoutUser } from "@/actions/auth";
import { Button } from "@/components/ui/button";

export function LogoutButton() {
  return (
    <form action={logoutUser}>
      <Button type="submit" variant="outline">
        Keluar
      </Button>
    </form>
  );
}
