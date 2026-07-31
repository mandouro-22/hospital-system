import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function page() {
  return (
    <div>
      <div>Hello world</div>

      <Link href="/sign-in">
        <Button>Go to login page </Button>
      </Link>
    </div>
  );
}
