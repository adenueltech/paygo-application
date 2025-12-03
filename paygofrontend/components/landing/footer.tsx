import { Wallet, Instagram, Facebook, Linkedin } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-gray-100 py-16">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid gap-12 md:grid-cols-4">
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center gap-2 text-black mb-6">
              <Wallet className="h-8 w-8" />
              <span className="text-2xl font-bold">PayGo</span>
            </div>
            <p className="text-gray-600">
              Pay only for what you use. Control your spending across all services with our flexible pay-as-you-go
              platform.
            </p>
          </div>

          <div>
            <h3 className="mb-6 font-bold text-black">About</h3>
            <ul className="space-y-4 text-gray-600">
              <li>
                <a href="#" className="hover:text-black">
                  About Us
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-black">
                  How it works
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-black">
                  Careers
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-black">
                  Press
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-black">
                  Blog
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-6 font-bold text-black">Security</h3>
            <ul className="space-y-4 text-gray-600">
              <li>
                <a href="#" className="hover:text-black">
                  Trust & Safety
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-black">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-black">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-black">
                  Data Protection
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-black">
                  Compliance
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-6 font-bold text-black">Help Center</h3>
            <ul className="space-y-4 text-gray-600">
              <li>
                <a href="#" className="hover:text-black">
                  FAQ
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-black">
                  Contact Support
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-black">
                  Getting Started
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-black">
                  Payment Help
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-black">
                  Community
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-16 flex flex-col items-center justify-between border-t border-gray-200 pt-8 md:flex-row">
          <p className="text-gray-500">2025 PayGo. All rights reserved</p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <a href="#" className="text-black hover:text-gray-600">
              <Instagram className="h-5 w-5" />
            </a>
            <a href="#" className="text-black hover:text-gray-600">
              <Facebook className="h-5 w-5" />
            </a>
            <a href="#" className="text-black hover:text-gray-600">
              <Linkedin className="h-5 w-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
