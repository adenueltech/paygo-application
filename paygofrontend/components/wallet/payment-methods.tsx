import { CreditCard, Plus, Wallet } from "lucide-react"
import { Button } from "@/components/ui/button"

export function PaymentMethods() {
  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white">Payment Methods</h3>
        <Button variant="ghost" size="sm" className="text-blue-400 hover:text-blue-300 hover:bg-blue-400/10">
          <Plus className="h-4 w-4 mr-1" />
          Add New
        </Button>
      </div>

      <div className="space-y-4">
        <div className="p-4 rounded-xl border border-white/10 bg-gradient-to-r from-gray-800 to-gray-900 flex items-center justify-between group cursor-pointer hover:border-white/30 transition-all">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center">
              <CreditCard className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-white font-medium">Mastercard •••• 4242</p>
              <p className="text-xs text-gray-400">Expires 12/25</p>
            </div>
          </div>
          <div className="h-4 w-4 rounded-full border border-white/30 group-hover:border-white flex items-center justify-center">
            <div className="h-2 w-2 rounded-full bg-white" />
          </div>
        </div>

        <div className="p-4 rounded-xl border border-white/10 bg-gradient-to-r from-gray-800 to-gray-900 flex items-center justify-between group cursor-pointer hover:border-white/30 transition-all">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-full bg-orange-500/10 flex items-center justify-center">
              <Wallet className="h-5 w-5 text-orange-500" />
            </div>
            <div>
              <p className="text-white font-medium">MetaMask Wallet</p>
              <p className="text-xs text-gray-400">0x71...39A2</p>
            </div>
          </div>
          <div className="h-4 w-4 rounded-full border border-white/30 group-hover:border-white" />
        </div>
      </div>
    </div>
  )
}
