const es = {
  header: {
    home: "Inicio",
    dashboard: "Panel"
  },
  nav: {
    groups: { student: "Estudiante", teacher: "Profesor", admin: "Admin" },
    notifications: "Notificaciones",
    settings: "Configuración",
    messages: "Mensajes",
    student: { dashboard: "Panel", plan: "Plan", timeline: "Cronología" },
    teacher: { dashboard: "Panel", gradingQueue: "Cola de calificación", enrollments: "Inscripciones" },
    admin: { dashboard: "Panel", users: "Usuarios", roles: "Roles", flags: "Flags", health: "Salud del sistema", reports: "Informes", parentLinks: "Enlaces de padres", audit: "Auditoría", providers: "Proveedores", catalog: "Catálogo" }
  },
  admin: {
    providers: {
      title: "Proveedores de cursos",
      columns: { name: "Nombre", domain: "Dominio", jwksUrl: "JWKS URL", health: "Estado", created: "Creado", actions: "Acciones" },
      buttons: { refresh: "Actualizar", checkHealth: "Verificar estado" },
      hint: { jwksReachable: "¿JWKS accesible? Ver registros" },
      empty: "Sin proveedores aún.",
      add: "Agregar proveedor"
    },
    parentLinks: {
      title: "Admin: Enlaces de padres",
      tip: "Consejo: agrega ?parent_id=... a la URL",
      provideHint: "Proporciona un parent_id en la cadena de consulta para ver enlaces.",
      columns: { student: "Estudiante", actions: "Acciones" },
      empty: "Sin enlaces aún."
    }
  },
  common: {
    back: "Atrás",
    save: "Guardar",
    add: "Agregar",
    remove: "Eliminar",
    load: "Cargar",
    apply: "Aplicar",
    seed: "Semilla",
    language: "Idioma",
    role: "Rol",
    menu: "Menú",
    navigation: "Navegación",
    close: "Cerrar",
    create: "Crear",
    delete: "Eliminar",
    creating: "Creando...",
    languageOptions: { en: "EN", es: "ES" },
    openInbox: "Abrir bandeja",
    skipToMain: "Saltar al contenido",
    prev: "Anterior",
    next: "Siguiente",
    backToCourses: "Volver a cursos"
  },
  settings: {
    title: "Configuración",
    notifications: "Preferencias de notificaciones",
    save: "Guardar",
    profile: "Perfil"
  },
  settings_profile: {
    name: "Nombre",
    bio: "Biografía"
  },
  notifications: {
    title: "Notificaciones",
    markAllRead: "Marcar todo como leído",
    empty: "No hay notificaciones",
    markRead: "Marcar como leído"
  },
  roles: {
    anon: "anónimo",
    teacher: "profesor",
    student: "estudiante",
    parent: "padre/madre",
    admin: "admin"
  },
  auth: {
    signin: "Iniciar sesión",
    notSignedIn: "No has iniciado sesión."
  },
  dashboard: {
    title: "Panel",
    student: "Panel del estudiante",
    teacher: "Tus cursos",
    admin: "Panel de administración"
  },
  teacher: {
    newCourse: {
      title: "Crear curso",
      created: "¡Creado!",
      launchKind: "Tipo de lanzamiento (opcional)",
      launchKindOptions: {
        none: "Ninguno (estándar)",
        webEmbed: "WebEmbed (iframe)",
        remoteContainer: "RemoteContainer (futuro)",
        streamedDesktop: "StreamedDesktop (futuro)"
      },
      launchUrl: "URL de lanzamiento (opcional)",
      provider: "Proveedor (opcional)",
      providerOptions: { none: "Ninguno" },
      scopes: "Alcances (opcional)",
      scopeOptions: {
        progressWrite: "progress.write",
        progressRead: "progress.read",
        attemptsWrite: "attempts.write",
        attemptsRead: "attempts.read",
        filesRead: "files.read",
        filesWrite: "files.write"
      }
    }
  },
  actions: {
    downloadCsv: "Descargar CSV"
  }
} as const;

export default es;


