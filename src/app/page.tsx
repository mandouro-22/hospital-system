import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function page() {
  return (
    <div>
      <div>Hello world</div>

      <Link href="/admin/users">
        <Button>Go to users page </Button>
      </Link>
    </div>
  );
}
