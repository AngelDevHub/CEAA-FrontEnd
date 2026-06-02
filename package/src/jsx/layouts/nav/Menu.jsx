export const MenuList = [
    // Dashboard / Reportes
    {
        title: 'Monitoreo',	
        classsChange: 'mm-collapse',		
        iconStyle: <i className="flaticon-381-networking"></i>,
        content: [
            { title: 'Temperatura', to: 'monitoreo-temperatura' },
            { title: 'Humedad', to: 'monitoreo-humedad' },
            { title: 'Niveles de Nitrógeno', to: 'monitoreo-nitrogeno' },
            { title: 'Riego', to: 'monitoreo-riego' },
            { title: 'Todas las gráficas', to: 'monitoreo-completo' },
            { title: 'Reportes', to: 'reportes' }
        ],
    },

    {
        title: 'Operación',
        classsChange: 'mm-collapse',
        iconStyle: <i className="flaticon-381-briefcase"></i>,
        content: [
            { title: 'Tareas', to: 'tareas' },
            { title: 'Bitácora de campo', to: 'bitacora' }
        ],
    },

    // Virtualización
    {
        title: 'Virtualización',
        classsChange: 'mm-collapse',
        iconStyle: <i className="flaticon-381-layer-1"></i>,
        content: [
            { title: 'Recorrido 3D', to: 'maquetado-3d' },
        ],
    },

    // Gestión de personal / staff
    {   
        title:'Personal',
        iconStyle: <i className="flaticon-381-id-card-4"></i>,        
        content : [
            { title: 'Lista de personal', to: 'staff-list' },
            { title: 'Agregar nuevo', to: 'staff-add' },
            { title: 'Roles', to: 'staff-roles' },
            { title: 'Turnos', to: 'staff-turnos' },
            { title: 'Reportes de asistencia', to: 'staff-asistencia' }
        ],
    },

    {
        title: 'Dispositivos',
        classsChange: 'mm-collapse',
        iconStyle: <i className="flaticon-381-settings"></i>,
        content: [
            { title: 'Estado y mantenimiento', to: 'dispositivos' }
        ],
    },

    // Configuración / ajustes
    {
        title: 'Configuración',
        iconStyle: <i className="flaticon-381-settings-2"></i>,
        content: [
            { title: 'Sensores', to: 'config-sensores' },
            { title: 'Alertas', to: 'config-alertas' },
            { title: 'Usuarios', to: 'config-usuarios' },
            { title: 'Sistema', to: 'config-sistema' },
        ],
    },

];
