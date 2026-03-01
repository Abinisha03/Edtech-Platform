import { SignIn } from "@clerk/nextjs";

export const dynamic = "force-dynamic";

export default function Page() {
    return (
        <div className="flex h-screen w-full items-center justify-center bg-muted/50">
            <SignIn forceRedirectUrl="/user/explorer" />
        </div>
    );
}
