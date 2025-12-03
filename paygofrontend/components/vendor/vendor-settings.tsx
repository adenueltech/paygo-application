import { User, Bell, CreditCard, Shield, Palette } from "lucide-react"
import { Button } from "@/components/ui/button"

const settings = [
  {
    icon: User,
    title: "Profile Settings",
    description: "Update your personal information and bio",
    action: "Edit Profile"
  },
  {
    icon: Bell,
    title: "Notifications",
    description: "Manage email and push notifications",
    action: "Configure"
  },
  {
    icon: CreditCard,
    title: "Payment Methods",
    description: "Add or update payment information",
    action: "Manage"
  },
  {
    icon: Shield,
    title: "Privacy & Security",
    description: "Control your privacy settings and security",
    action: "Settings"
  },
  {
    icon: Palette,
    title: "Appearance",
    description: "Customize your dashboard theme",
    action: "Customize"
  }
]

export function VendorSettings() {
  return (
    <div className="rounded-xl bg-white/5 border border-white/10 p-6">
      <h3 className="text-lg font-semibold text-white mb-6">Vendor Settings</h3>

      <div className="space-y-4">
        {settings.map((setting, index) => (
          <div key={index} className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-lg bg-white/10 flex items-center justify-center">
                <setting.icon className="h-5 w-5 text-white" />
              </div>
              <div>
                <h4 className="text-white font-medium">{setting.title}</h4>
                <p className="text-sm text-gray-400">{setting.description}</p>
              </div>
            </div>
            <Button variant="outline" size="sm" className="bg-white/5 border-white/10 text-white hover:bg-white/10">
              {setting.action}
            </Button>
          </div>
        ))}
      </div>
    </div>
  )
}