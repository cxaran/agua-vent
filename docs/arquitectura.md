

Core del proyecto, elementos iniciales de la api y conexiones
1- backend\core\settings.py
2- backend\core\database.py
3- backend\core\redis.py

Usuarios e inicio de sesion

Tablas de usuario en db
4- backend\models\base.py
5- backend\models\user.py

Esquemas para autentificaicon y manejo de sesion
6- backend\schemas\user.py
7- backend\schemas\auth.py

Autentificacion
8- backend\auth\security.py
9- backend\auth\register.py
10- backend\auth\forgotpassword.py
11- backend\auth\locked.py
12- backend\auth\auth.py
13- backend\auth\auth_dependencies.py

Manejo de roles y permisos 
14- backend\security\security_control.py
15- backend\security\security_group.py

Infraestructura Docker (ver docs\docker.md)
- compose.yaml
- compose.dev.yaml
- nginx\nginx.conf
- backend\Dockerfile
- frontend\Dockerfile

Grupos de permisos (ver docs\permisos.md)
16- backend\security\groups\dashboard.py
17- backend\security\groups\pos.py
18- backend\security\groups\inventory.py
19- backend\security\groups\jugs.py
20- backend\security\groups\customer.py
21- backend\security\groups\routes.py
22- backend\security\groups\cash.py
23- backend\security\groups\reports.py
24- backend\security\groups\settings.py
