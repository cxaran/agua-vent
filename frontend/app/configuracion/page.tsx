"use client"

import { useState } from "react"
import POSLayout from "@/components/pos/pos-layout"
import {
  Settings,
  Building,
  Users,
  Printer,
  CreditCard,
  Bell,
  Shield,
  Database,
  FileText,
  ChevronRight,
  Save,
} from "lucide-react"

const settingsSections = [
  {
    id: "empresa",
    title: "Datos de la Empresa",
    description: "Informacion fiscal y datos de contacto",
    icon: Building,
  },
  {
    id: "usuarios",
    title: "Usuarios y Permisos",
    description: "Gestion de usuarios y roles",
    icon: Users,
  },
  {
    id: "impresion",
    title: "Impresion y Tickets",
    description: "Configuracion de impresora y formato de tickets",
    icon: Printer,
  },
  {
    id: "pagos",
    title: "Metodos de Pago",
    description: "Configuracion de formas de pago aceptadas",
    icon: CreditCard,
  },
  {
    id: "notificaciones",
    title: "Notificaciones",
    description: "Alertas de stock bajo, cobranza, etc.",
    icon: Bell,
  },
  {
    id: "seguridad",
    title: "Seguridad",
    description: "Respaldos y configuracion de acceso",
    icon: Shield,
  },
  {
    id: "facturacion",
    title: "Facturacion (CFDI)",
    description: "Configuracion de timbrado fiscal",
    icon: FileText,
  },
  {
    id: "base_datos",
    title: "Base de Datos",
    description: "Respaldo y restauracion de datos",
    icon: Database,
  },
]

export default function ConfiguracionPage() {
  const [activeSection, setActiveSection] = useState("empresa")

  return (
    <POSLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold">Configuracion</h1>
          <p className="text-muted-foreground">Administra la configuracion de tu sistema POS</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-card border border-border rounded-lg overflow-hidden">
              {settingsSections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full flex items-center gap-3 p-4 text-left border-b border-border last:border-b-0 transition-colors ${
                    activeSection === section.id
                      ? "bg-primary/10 text-primary"
                      : "hover:bg-muted/50"
                  }`}
                >
                  <section.icon className="h-5 w-5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{section.title}</p>
                    <p className="text-xs text-muted-foreground truncate">{section.description}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </button>
              ))}
            </div>
          </div>

          {/* Content Area */}
          <div className="lg:col-span-3">
            {activeSection === "empresa" && (
              <div className="bg-card border border-border rounded-lg p-6 space-y-6">
                <div>
                  <h2 className="text-lg font-semibold">Datos de la Empresa</h2>
                  <p className="text-sm text-muted-foreground">
                    Esta informacion aparecera en tus tickets y facturas
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Nombre del Negocio</label>
                    <input
                      type="text"
                      defaultValue="Purificadora AguaPura"
                      className="w-full h-10 px-4 bg-input border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">RFC</label>
                    <input
                      type="text"
                      defaultValue="PAQ901201ABC"
                      className="w-full h-10 px-4 bg-input border border-border rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-2">Direccion Fiscal</label>
                    <input
                      type="text"
                      defaultValue="Av. Principal 123, Col. Centro, CP 12345"
                      className="w-full h-10 px-4 bg-input border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Telefono</label>
                    <input
                      type="text"
                      defaultValue="555-123-4567"
                      className="w-full h-10 px-4 bg-input border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Email</label>
                    <input
                      type="email"
                      defaultValue="contacto@aguapura.com"
                      className="w-full h-10 px-4 bg-input border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-border">
                  <button className="flex items-center gap-2 h-10 px-6 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors">
                    <Save className="h-4 w-4" />
                    Guardar Cambios
                  </button>
                </div>
              </div>
            )}

            {activeSection === "usuarios" && (
              <div className="bg-card border border-border rounded-lg p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold">Usuarios y Permisos</h2>
                    <p className="text-sm text-muted-foreground">
                      Gestiona los usuarios que pueden acceder al sistema
                    </p>
                  </div>
                  <button className="flex items-center gap-2 h-10 px-4 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors">
                    Agregar Usuario
                  </button>
                </div>

                <div className="divide-y divide-border">
                  {[
                    { name: "Carlos Martinez", role: "Administrador", email: "carlos@aguapura.com", status: "activo" },
                    { name: "Ana Rodriguez", role: "Cajero", email: "ana@aguapura.com", status: "activo" },
                    { name: "Pedro Sanchez", role: "Repartidor", email: "pedro@aguapura.com", status: "activo" },
                    { name: "Maria Lopez", role: "Cajero", email: "maria@aguapura.com", status: "inactivo" },
                  ].map((user, idx) => (
                    <div key={idx} className="py-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <Users className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{user.name}</p>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-sm">{user.role}</span>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            user.status === "activo"
                              ? "bg-success/10 text-success"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {user.status}
                        </span>
                        <button className="text-sm text-primary hover:underline">Editar</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeSection !== "empresa" && activeSection !== "usuarios" && (
              <div className="bg-card border border-border rounded-lg p-6">
                <div className="text-center py-12">
                  <Settings className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h2 className="text-lg font-semibold mb-2">
                    {settingsSections.find((s) => s.id === activeSection)?.title}
                  </h2>
                  <p className="text-muted-foreground">
                    Esta seccion estara disponible proximamente
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </POSLayout>
  )
}
