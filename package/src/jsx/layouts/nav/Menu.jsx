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
            { title: 'Todas las gráficas', to: 'monitoreo-completo' }
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

    {
        title: 'PerfilUsuario',	
        iconStyle: <i className="flaticon-381-television"></i>,
        content: [
            { title: 'Profile',to: 'profile'}, 
        ],
    }
];
