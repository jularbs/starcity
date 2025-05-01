"use client"

import {
  ChevronRight,
  Ticket,
  CreditCard,
  ShoppingCart,
  StickyNote,
  Rocket,
  ImageIcon,
  ImagesIcon,
  Settings,
  Users,
  Activity,
  Home,
  Gem,
} from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"
import Link from "next/link"
import NavigationFooter from "./NavigationFooter"

export function NavigationSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="grid flex-1 text-sm leading-tight text-left">
                <span className="font-medium truncate">Star City</span>
                <span className="text-xs truncate">Administrator</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            <SidebarMenuItem>
              <Link href="/dashboard">
                <SidebarMenuButton tooltip="Dashboard">
                  <Home />
                  <span>Dashboard</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <a href={process.env.NEXT_PUBLIC_WEB_DOMAIN} target="_blank">
                <SidebarMenuButton tooltip="Homepage">
                  <Home />
                  <span>Ecommerce Homepage</span>
                </SidebarMenuButton>
              </a>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>

        {/* Ecommerce Group */}
        <SidebarGroup>
          <SidebarGroupLabel>E-Commerce</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
              <Link href="/dashboard/tickets-management">
                <SidebarMenuButton tooltip="Tickets Management">
                  <Ticket />
                  <span>Tickets Management</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <Link href="/dashboard/payment-gateway">
                <SidebarMenuButton tooltip="Payment Gateway">
                  <CreditCard />
                  <span>Payment Gateway</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <Link href="/dashboard/sales-management">
                <SidebarMenuButton tooltip="Sales Management">
                  <ShoppingCart />
                  <span>Sales Management</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <Link href="/dashboard/promos-management">
                <SidebarMenuButton tooltip="Promos Management">
                  <Gem />
                  <span>Promos Management</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
        {/* Content Management Group */}
        <SidebarGroup>
          <SidebarGroupLabel>E-Commerce</SidebarGroupLabel>
          <SidebarMenu>
            {/* Collapsible Menu */}
            <Collapsible
              asChild
              className="group/collapsible"
            >
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton tooltip="Posts Management">
                    <StickyNote />
                    <span>Posts Management</span>
                    <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton asChild>
                        <Link href={`/dashboard/post-management/create-post`}>
                          <span>Create New Post</span>
                        </Link>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton asChild>
                        <Link href={`/dashboard/post-management`}>
                          <span>View Posts</span>
                        </Link>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
            <Collapsible
              asChild
              className="group/collapsible"
            >
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton tooltip="Pages Management">
                    <StickyNote />
                    <span>Pages Management</span>
                    <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton asChild>
                        <Link href={`/dashboard/page-management/park_regulations`}>
                          <span>Park Regulations</span>
                        </Link>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton asChild>
                        <Link href={`/dashboard/page-management/promos`}>
                          <span>Promos</span>
                        </Link>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton asChild>
                        <Link href={`/dashboard/page-management/park_directions`}>
                          <span>Park Directions</span>
                        </Link>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton asChild>
                        <Link href={`/dashboard/page-management/faqs`}>
                          <span>FAQs</span>
                        </Link>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton asChild>
                        <Link href={`/dashboard/page-management/privacy_policy`}>
                          <span>Privacy Policy</span>
                        </Link>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton asChild>
                        <Link href={`/dashboard/page-management/terms_and_conditions`}>
                          <span>Terms and Conditions</span>
                        </Link>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton asChild>
                        <Link href={`/dashboard/page-management/eticket_consent_clause`}>
                          <span>Pre-purchase Message</span>
                        </Link>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton asChild>
                        <Link href={`/dashboard/page-management/tickets_footer`}>
                          <span>Tickets Footer</span>
                        </Link>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
            <Collapsible
              asChild
              className="group/collapsible"
            >
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton tooltip="Rides Management">
                    <Rocket />
                    <span>Rides Management</span>
                    <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton asChild>
                        <Link href={`/dashboard/rides-management/rides`}>
                          <span>Manage Rides</span>
                        </Link>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton asChild>
                        <Link href={`/dashboard/rides-management/categories`}>
                          <span>Ride Categories</span>
                        </Link>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>

            <SidebarMenuItem>
              <Link href="/dashboard/image-slider-management">
                <SidebarMenuButton tooltip="Image Slider">
                  <ImagesIcon />
                  <span>Image Slider</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <Link href="/dashboard/banner-management">
                <SidebarMenuButton tooltip="Banner Management">
                  <ImageIcon />
                  <span>Banner Management</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
        {/* Site Management Group */}
        <SidebarGroup>
          <SidebarGroupLabel>Site Settings</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
              <Link href="/dashboard/settings">
                <SidebarMenuButton tooltip="Manage Settings">
                  <Settings />
                  <span>Manage Settings</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <Link href="/dashboard/user-management">
                <SidebarMenuButton tooltip="User Management">
                  <Users />
                  <span>User Management</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <Link href="/dashboard/activity-monitor">
                <SidebarMenuButton tooltip="Activity Monitor">
                  <Activity />
                  <span>Activity Monitor</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <NavigationFooter />
      <SidebarRail />
    </Sidebar>
  )
}
