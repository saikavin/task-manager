import { AuthSetupGuide } from "@/components/auth-setup-guide"

export default function SetupPage() {
  return (
    <div className="min-h-screen bg-background p-4">
      <div className="container mx-auto py-8">
        <AuthSetupGuide />
      </div>
    </div>
  )
}
