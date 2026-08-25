Convenções de Organização do Projeto

Este documento define o padrão de organização, nomenclatura e comentários para todo o boilerplate.

Estrutura principal:

boilerplate-full/
├── frontend/
└── api/

frontend/: Next.js + TypeScript

api/: Laravel + PHP

O objetivo é que qualquer arquivo do projeto tenha uma estrutura previsível e fácil de navegar.

1. Princípios gerais

Todos os arquivos devem seguir estes princípios:

Separar dependências por responsabilidade.

Manter uma ordem consistente.

Usar comentários para organizar blocos relevantes.

Não comentar código óbvio.

Remover imports e código não utilizados.

Utilizar nomes descritivos.

Evitar arquivos com múltiplas responsabilidades.

Preferir padrões do próprio framework quando eles já resolvem o problema.

Todo import de arquivo de aplicação deve estar obrigatoriamente dentro de uma seção comentada.

Arquivos fixos, gerados ou puramente de configuração podem ser ignorados.

O padrão principal para comentários organizacionais é:

//\* Nome da seção

No PHP:

//\* Nome da seção

Esses comentários servem para separar responsabilidades visualmente.

Não devem ser usados para narrar cada linha do código.

2. Frontend

Local:

frontend/

Stack principal:

Next.js
TypeScript
TanStack Query
Axios
Zod
Tailwind

3. Diretivas do Next.js

Diretivas como:

"use client"

devem sempre aparecer no topo do arquivo, antes dos imports.

Exemplo:

"use client"

//\* Components Imports
import Button from "@/components/ui/button";

Não utilizar "use client" se o componente puder continuar sendo um Server Component.

4. Ordem dos imports no frontend

Ordem preferencial:

1. Components
2. Libraries
3. Hooks
4. Services
5. Schemas
6. Types
7. Constants
8. Utils
9. Assets / Styles

Só criar uma seção quando houver imports daquela categoria.

Porém, se houver ao menos um import da categoria, o comentário da seção é obrigatório.

Components Imports

//\* Components Imports
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import Card from "@/components/ui/card";

import UserAvatar from "./user-avatar";

Libraries Imports

Dependências externas e recursos do framework.

//\* Libraries Imports
import Link from "next/link";
import { useRouter } from "next/navigation";
import { UserKeyIcon } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

Hooks Imports

//\* Hooks Imports
import { useLogin } from "@/hooks/auth/use-login";
import { useCurrentUser } from "@/hooks/auth/use-current-user";

Services Imports

//\* Services Imports
import { login } from "@/services/auth-service";
import { getUsers } from "@/services/user-service";

Schemas Imports

//\* Schemas Imports
import { loginSchema } from "@/schemas/auth";
import { userSchema } from "@/schemas/user";

Types Imports

Imports usados apenas como tipos devem utilizar import type.

//\* Types Imports
import type { UserType } from "@/schemas/user";
import type { LoginPayload } from "@/services/auth-service";

Constants Imports

//\* Constants Imports
import roles from "@/constants/roles";
import routes from "@/constants/routes";

Utils Imports

//\* Utils Imports
import { cn } from "@/lib/utils";
import { formatDate } from "@/utils/date";

5. Estrutura interna de componentes

Ordem preferencial:

1. Hooks
2. Estados
3. Variáveis derivadas
4. Handlers
5. Return

Exemplo:

export default function LoginForm() {
const loginMutation = useLogin();
const router = useRouter();

    function handleLogin(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const formData = new FormData(event.currentTarget);

        const email = formData.get("email") as string;
        const password = formData.get("password") as string;

        loginMutation.mutate(
            {
                email,
                password,
            },
            {
                onSuccess: () => {
                    router.push("/dashboard");
                },
            }
        );
    }

    return (
        <form onSubmit={handleLogin}>
            ...
        </form>
    );

}

Não é necessário adicionar comentários como:

// Hooks
const router = useRouter();

// Função de login
function handleLogin() {}

A estrutura já deve deixar isso claro.

6. Handlers

Eventos devem utilizar preferencialmente o prefixo handle.

handleLogin
handleSubmit
handleDelete
handleChange
handleLogout
handleOpenModal

Evitar:

click
submit
func
action
doLogin

7. Componentes

Componentes utilizam PascalCase.

LoginForm
UserCard
DashboardHeader
RoleSelector

Arquivos utilizam preferencialmente kebab-case.

login-form.tsx
user-card.tsx
dashboard-header.tsx
role-selector.tsx

8. Funções e variáveis

Utilizar camelCase.

const loginMutation = useLogin();
const currentUser = getCurrentUser();

function handleLogin() {}

9. Tipos

Utilizar PascalCase.

type LoginPayload = {
email: string;
password: string;
};

type LoginFormProps = {
redirectTo?: string;
};

Evitar:

type propsLoginForm = {};
type loginType = {};

Preferir:

type LoginFormProps = {};
type LoginType = {};

10. Props

Declarar o tipo antes do componente.

//\* Types Imports
import type { RoleType } from "@/schemas/role";

type RoleCardProps = {
role: RoleType;
};

export default function RoleCard({ role }: RoleCardProps) {
return (
<div>
<role.icon />
<span>{role.name}</span>
</div>
);
}

Preferir destructuring quando melhorar a leitura.

11. Comentários no frontend

Usar para

Separar responsabilidades:

//\* Components Imports

Explicar decisões não óbvias:

// O backend exige o cookie CSRF antes das mutations autenticadas.
await getCsrfCookie();

Explicar workarounds:

// O rewrite mantém a API acessível pelo mesmo domínio do frontend.

Não usar para

Narrar código óbvio:

// Pega o email.
const email = formData.get("email");

// Faz login.
loginMutation.mutate(...);

Também não deixar código morto comentado.

Errado:

// import algumaCoisa from "...";
// const teste = ...

O Git já mantém o histórico.

12. Exemplo completo de componente frontend

"use client"

//\* Components Imports
import Button, { buttonVariants } from "@/components/ui/button";
import Input from "@/components/ui/input";
import Card from "@/components/ui/card";

//\* Libraries Imports
import Link from "next/link";
import { UserKeyIcon } from "lucide-react";
import { useRouter } from "next/navigation";

//\* Hooks Imports
import { useLogin } from "@/hooks/auth/use-login";

export default function LoginForm() {
const loginMutation = useLogin();
const router = useRouter();

    function handleLogin(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const formData = new FormData(event.currentTarget);

        const email = formData.get("email") as string;
        const password = formData.get("password") as string;

        loginMutation.mutate(
            {
                email,
                password,
            },
            {
                onSuccess: () => {
                    router.push("/dashboard");
                },
            }
        );
    }

    return (
        <form onSubmit={handleLogin}>
            <Card.CardRoot>
                <Card.CardHeader>
                    <Card.CardTitle>
                        <div className="flex gap-2">
                            <UserKeyIcon />
                            Login
                        </div>
                    </Card.CardTitle>
                </Card.CardHeader>

                <Card.CardContent>
                    <div className="flex flex-col gap-2">
                        <Input
                            placeholder="Email"
                            type="email"
                            name="email"
                        />

                        <Input
                            placeholder="Senha"
                            type="password"
                            name="password"
                        />
                    </div>

                    <div className="mt-4 flex flex-col gap-2">
                        <Button
                            type="submit"
                            disabled={loginMutation.isPending}
                            variant="foreground"
                        >
                            {loginMutation.isPending
                                ? "Entrando..."
                                : "Entrar"}
                        </Button>

                        <Link
                            href="/select-sign-up"
                            className={buttonVariants({
                                variant: "foreground",
                            })}
                        >
                            Cadastrar
                        </Link>
                    </div>
                </Card.CardContent>

                <Card.CardDescription>
                    Insira seu email e senha para acessar sua conta.
                </Card.CardDescription>

                <Card.CardFooter>
                    <Link href="/forgot-password">
                        Esqueci minha senha
                    </Link>
                </Card.CardFooter>
            </Card.CardRoot>
        </form>
    );

}

13. Template de componente frontend

"use client"

//\* Components Imports

//\* Libraries Imports

//\* Hooks Imports

//\* Services Imports

//\* Schemas Imports

//\* Types Imports

//\* Constants Imports

//\* Utils Imports

export default function ComponentName() {
return (
<div>
...
</div>
);
}

Remover todas as seções vazias antes de finalizar o arquivo.

14. Template de service frontend

//\* Utils Imports
import http from "@/lib/http";

//\* Types Imports
import type { UserType } from "@/schemas/user";

export type ExamplePayload = {
field: string;
};

type ExampleResponse = {
message: string;
data: UserType;
};

export async function example(
payload: ExamplePayload
): Promise<ExampleResponse> {
const { data } = await http.post<ExampleResponse>(
"/api/example",
payload
);

    return data;

}

15. Template de hook frontend

//\* Libraries Imports
import { useMutation } from "@tanstack/react-query";

//\* Services Imports
import { example } from "@/services/example-service";

export function useExample() {
return useMutation({
mutationFn: example,
});
}

16. API

Local:

api/

Framework:

Laravel

A API também deve possuir arquivos organizados e previsíveis.

Porém, o padrão deve respeitar a estrutura natural do Laravel.

Exemplo:

api/
├── app/
│ ├── Http/
│ │ ├── Controllers/
│ │ ├── Middleware/
│ │ └── Requests/
│ ├── Models/
│ ├── Policies/
│ ├── Services/
│ └── ...
├── database/
│ ├── factories/
│ ├── migrations/
│ └── seeders/
├── routes/
└── tests/

17. Ordem dos imports no Laravel

No PHP, os imports são feitos através de use.

Eles também devem ser agrupados por responsabilidade quando o arquivo possuir várias dependências.

Ordem recomendada:

1. Models
2. Requests
3. Services
4. Resources
5. Enums
6. Exceptions
7. Laravel / Framework
8. Bibliotecas externas

Exemplo:

<?php

namespace App\Http\Controllers\Auth;

//* Models Imports
use App\Models\User;

//* Requests Imports
use App\Http\Requests\Auth\RegisterRequest;

//* Services Imports
use App\Services\AuthService;

//* Laravel Imports
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;

Nem todo arquivo precisa possuir todas essas categorias.

Porém, todo import utilizado deve obrigatoriamente estar dentro de uma categoria comentada, mesmo que exista apenas um único import naquela categoria.

Exemplo com apenas um import:

//* Laravel Imports
use Illuminate\Foundation\Http\FormRequest;

A quantidade de imports não altera a regra.

18. Namespace

O namespace sempre aparece imediatamente após:

<?php

Exemplo:

<?php

namespace App\Http\Controllers\Auth;

Depois do namespace vêm os imports.

19. Controllers

Controllers devem ser pequenos.

Responsabilidade principal:

receber request
↓
chamar regra necessária
↓
retornar response

Evitar colocar grandes regras de negócio diretamente no Controller.

Exemplo:

<?php

namespace App\Http\Controllers\Auth;

//* Requests Imports
use App\Http\Requests\Auth\LoginRequest;

//* Laravel Imports
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;

class LoginController extends Controller
{
    public function __invoke(LoginRequest $request): JsonResponse
    {
        $credentials = $request->safe()->only([
            'email',
            'password',
        ]);

        if (! Auth::attempt($credentials)) {
            return response()->json([
                'message' => 'Invalid credentials.',
            ], 401);
        }

        // Regenera a sessão após autenticação para evitar session fixation.
        $request->session()->regenerate();

        return response()->json([
            'message' => 'Logged in successfully.',
            'data' => $request->user(),
        ]);
    }
}

20. Form Requests

Validação deve ficar preferencialmente em FormRequest.

Estrutura recomendada:

authorize()
rules()
messages()    // somente quando necessário
attributes()  // somente quando necessário

Exemplo:

<?php

namespace App\Http\Requests\Auth;

//* Laravel Imports
use Illuminate\Foundation\Http\FormRequest;

class LoginRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'email' => [
                'required',
                'email',
            ],

            'password' => [
                'required',
                'string',
            ],
        ];
    }
}

Não duplicar essas validações no Controller.

21. Models

Models devem concentrar comportamento relacionado à entidade.

Ordem recomendada dentro de um Model:

1. Traits
2. Fillable / Guarded
3. Hidden
4. Casts
5. Relationships
6. Scopes
7. Accessors / Mutators
8. Métodos específicos do domínio

Exemplo:

<?php

namespace App\Models;

//* Laravel Imports
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use HasFactory;
    use Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }
}

22. Services

Criar Services quando houver regra de negócio que não pertence naturalmente ao Controller ou Model.

Exemplo de estrutura:

app/
└── Services/
    ├── AuthService.php
    ├── UserService.php
    └── ClinicService.php

Exemplo:

<?php

namespace App\Services;

//* Models Imports
use App\Models\User;

//* Laravel Imports
use Illuminate\Support\Facades\DB;

class UserService
{
    public function create(array $data): User
    {
        return DB::transaction(function () use ($data) {
            return User::create($data);
        });
    }
}

Não criar Services apenas para envolver uma única linha sem adicionar responsabilidade real.

23. Policies

Policies devem concentrar autorização relacionada a uma entidade.

Exemplo:

<?php

namespace App\Policies;

//* Models Imports
use App\Models\User;

class UserPolicy
{
    public function view(User $user, User $target): bool
    {
        return $user->id === $target->id;
    }

    public function update(User $user, User $target): bool
    {
        return $user->id === $target->id;
    }
}

Evitar espalhar regras de autorização manualmente por Controllers.

24. Enums

Enums devem representar conjuntos fechados de valores do domínio.

Exemplo:

<?php

namespace App\Enums;

enum UserRole: string
{
    case ADMIN = 'admin';
    case USER = 'user';
}

Não substituir enums por strings repetidas pelo projeto quando os valores forem conhecidos e fechados.

25. Migrations

Migrations devem possuir apenas alterações relacionadas ao banco de dados.

Não adicionar regras de aplicação dentro delas.

Exemplo:

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('email')->unique();
            $table->string('password');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('users');
    }
};

Em migrations que forem criadas ou alteradas por nós, os imports também devem seguir o padrão obrigatório de comentários por categoria.

Exemplo:

//* Laravel Imports
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

Arquivos gerados automaticamente, arquivos fixos do framework e arquivos de configuração que não fazem parte do código comum da aplicação podem ser mantidos no formato original.

26. Factories

Factories devem definir dados padrão válidos para testes e desenvolvimento.

<?php

namespace Database\Factories;

//* Laravel Imports
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class UserFactory extends Factory
{
    public function definition(): array
    {
        return [
            'name' => fake()->name(),
            'email' => fake()->unique()->safeEmail(),
            'email_verified_at' => now(),
            'password' => Hash::make('password'),
            'remember_token' => Str::random(10),
        ];
    }
}

27. Seeders

Seeders devem ser simples e previsíveis.

<?php

namespace Database\Seeders;

//* Models Imports
use App\Models\User;

//* Laravel Imports
use Illuminate\Database\Seeder;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        User::factory()->create([
            'name' => 'Admin',
            'email' => 'admin@example.com',
        ]);
    }
}

28. Routes

Arquivos de rota devem permanecer pequenos.

Evitar regras de negócio diretamente em closures.

Preferir:

use App\Http\Controllers\Auth\LoginController;

Route::post('/login', LoginController::class);

Evitar:

Route::post('/login', function (Request $request) {
    // dezenas de linhas de autenticação...
});

Quando houver várias áreas, organizar visualmente.

Exemplo:

//* Auth Routes
Route::post('/register', RegisterController::class);
Route::post('/login', LoginController::class);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/me', MeController::class);
    Route::post('/logout', LogoutController::class);
});

//* User Routes
Route::middleware('auth:sanctum')->group(function () {
    Route::apiResource('users', UserController::class);
});

29. Métodos dentro de classes Laravel

A ordem depende do tipo de classe.

Controller

__construct
__invoke
index
store
show
update
destroy
métodos privados auxiliares

Não é necessário implementar todos.

Model

traits
properties
casts
relationships
scopes
accessors/mutators
domain methods

Service

Agrupar métodos relacionados.

Métodos públicos antes dos helpers privados.

class UserService
{
    public function create(array $data): User
    {
        ...
    }

    public function update(User $user, array $data): User
    {
        ...
    }

    private function normalizeData(array $data): array
    {
        ...
    }
}

30. Nomenclatura Laravel

Classes utilizam PascalCase.

LoginController
LoginRequest
UserService
UserPolicy

Métodos e variáveis utilizam camelCase.

$currentUser
$loginData

public function createUser(): User

Tabelas e colunas seguem o padrão do Laravel:

users
clinic_users

created_at
updated_at
email_verified_at

31. Comentários na API

Assim como no frontend, comentários devem explicar decisões e responsabilidades.

Bom:

// Regenera a sessão para evitar session fixation após autenticação.
$request->session()->regenerate();

Bom:

// Operação atômica: usuário e perfil devem ser persistidos juntos.
DB::transaction(function () {
    ...
});

Ruim:

// Busca usuário.
$user = User::find($id);

// Retorna usuário.
return $user;

32. DocBlocks

Não adicionar PHPDoc redundante quando PHP já consegue expressar o tipo.

Evitar:

/**
 * @return bool
 */
public function authorize(): bool
{
    return true;
}

O : bool já informa o tipo.

Utilizar PHPDoc quando adicionar informação útil que o sistema de tipos não consegue expressar claramente.

Exemplo:

/**
 * @param array{name: string, email: string, password: string} $data
 */
public function create(array $data): User
{
    ...
}

33. Tipagem no PHP

Sempre que possível, utilizar tipos explícitos.

Preferir:

public function create(array $data): User

em vez de:

public function create($data)

Preferir:

public function __invoke(LoginRequest $request): JsonResponse

em vez de:

public function __invoke($request)

34. Responsabilidade por camada

Fluxo recomendado:

Route
↓
Controller
↓
FormRequest
↓
Service / Model
↓
Database
↓
Resource / Response

Nem toda funcionalidade precisa passar obrigatoriamente por todas as camadas.

A complexidade deve justificar a abstração.

Route

Define qual endpoint aponta para qual ação.

FormRequest

Valida e autoriza os dados recebidos.

Controller

Coordena a requisição e a resposta.

Service

Concentra regras de negócio maiores ou processos que envolvem múltiplas entidades.

Model

Representa a entidade, seus relacionamentos e comportamento diretamente relacionado a ela.

Policy

Define quem pode executar determinada ação.

Resource

Define a representação da entidade enviada pela API quando necessário.

35. Evitar abstração excessiva

Organização não significa criar uma camada para tudo.

Para uma operação simples:

User::create($data);

não é obrigatório criar:

UserRepository
UserRepositoryInterface
UserService
UserManager
UserFactoryService

sem necessidade.

O padrão deve deixar o código mais simples, e não apenas aumentar a quantidade de arquivos.

36. Estrutura recomendada do frontend

frontend/
├── app/
├── components/
│   ├── ui/
│   └── ...
├── constants/
├── hooks/
├── lib/
├── schemas/
├── services/
├── types/
└── utils/

Responsabilidades:

app/
    rotas, layouts e páginas

components/
    componentes reutilizáveis

hooks/
    hooks customizados

services/
    comunicação com API

schemas/
    schemas Zod e tipos derivados

constants/
    valores fixos da aplicação

lib/
    configuração de bibliotecas e infraestrutura

utils/
    funções utilitárias puras

37. Estrutura recomendada da API

api/
├── app/
│   ├── Enums/
│   ├── Exceptions/
│   ├── Http/
│   │   ├── Controllers/
│   │   ├── Middleware/
│   │   ├── Requests/
│   │   └── Resources/
│   ├── Models/
│   ├── Policies/
│   └── Services/
├── bootstrap/
├── config/
├── database/
│   ├── factories/
│   ├── migrations/
│   └── seeders/
├── routes/
└── tests/

Não criar pastas vazias antecipadamente.

Criar conforme a aplicação realmente precisar.

38. Exemplo frontend + API

Uma funcionalidade de login pode ser distribuída assim:

frontend/
├── app/
│   └── login/
├── components/
│   └── auth/
│       └── login-form.tsx
├── hooks/
│   └── auth/
│       └── use-login.ts
└── services/
    └── auth-service.ts

api/
├── app/
│   └── Http/
│       ├── Controllers/
│       │   └── Auth/
│       │       └── LoginController.php
│       └── Requests/
│           └── Auth/
│               └── LoginRequest.php
└── routes/
    └── api.php

Fluxo:

LoginForm
↓
useLogin
↓
auth-service
↓
/api/login
↓
LoginRequest
↓
LoginController
↓
Auth
↓
JSON Response

Cada arquivo possui uma responsabilidade clara.

39. Regra obrigatória para organização de imports

A separação por comentários é obrigatória em todos os arquivos de código da aplicação, tanto no frontend/ quanto na api/.

Não importa se existe:

1 import
2 imports
10 imports

Se o arquivo utiliza imports, eles devem estar dentro da categoria correspondente.

Frontend:

//* Components Imports
import Button from "@/components/ui/button";

//* Libraries Imports
import Link from "next/link";

//* Hooks Imports
import { useLogin } from "@/hooks/auth/use-login";

Mesmo com apenas um import:

//* Libraries Imports
import Link from "next/link";

Laravel:

//* Requests Imports
use App\Http\Requests\Auth\LoginRequest;

//* Laravel Imports
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;

Mesmo com apenas um import:

//* Laravel Imports
use Illuminate\Foundation\Http\FormRequest;

Não deixar imports soltos como:

use Illuminate\Foundation\Http\FormRequest;

ou:

import Link from "next/link";

Eles devem ser classificados.

Categorias obrigatórias no frontend

Utilizar conforme os imports existentes:

//* Components Imports
//* Libraries Imports
//* Hooks Imports
//* Services Imports
//* Schemas Imports
//* Types Imports
//* Constants Imports
//* Utils Imports
//* Assets Imports
//* Styles Imports

Não adicionar categorias vazias.

Se não há Hook no arquivo, por exemplo, não adicionar:

//* Hooks Imports

Categorias obrigatórias na API Laravel

Utilizar conforme os imports existentes:

//* Models Imports
//* Requests Imports
//* Services Imports
//* Resources Imports
//* Policies Imports
//* Enums Imports
//* Exceptions Imports
//* Contracts Imports
//* Laravel Imports
//* Libraries Imports

Se surgir uma categoria recorrente que não esteja nessa lista, criar um nome coerente seguindo:

//* Nome Imports

e manter o mesmo nome em todo o projeto.

Arquivos ignorados por essa regra

A obrigatoriedade vale para arquivos de código da aplicação que nós criamos ou mantemos.

Podem ser ignorados arquivos fixos, gerados automaticamente ou puramente de configuração, quando reorganizá-los não trouxer benefício e puder divergir do formato esperado pela ferramenta/framework.

Exemplos típicos:

frontend/next.config.ts
frontend/eslint.config.*
frontend/postcss.config.*
frontend/tailwind config, quando existir
frontend arquivos gerados automaticamente

api/config/*
api/bootstrap/*
api/vendor/*
api/storage/*
api arquivos gerados automaticamente pelo framework/ferramentas

A exceção não deve ser usada para arquivos normais da aplicação.

Estes continuam obrigatoriamente organizados:

frontend/components/*
frontend/hooks/*
frontend/services/*
frontend/schemas/*
frontend/lib/*
frontend/utils/*
frontend/app/* quando possuir código da aplicação

api/app/Http/Controllers/*
api/app/Http/Requests/*
api/app/Models/*
api/app/Services/*
api/app/Policies/*
api/app/Enums/*
api/app/Http/Resources/*
api/database/factories/*
api/database/seeders/*
api/database/migrations/* quando criadas ou alteradas por nós
api/routes/* quando forem arquivos de rotas da aplicação mantidos por nós
api/tests/*

Regra de consistência

Nunca misturar:

//* Models Imports
use App\Models\User;

use Illuminate\Http\JsonResponse;

O segundo import também precisa de categoria:

//* Models Imports
use App\Models\User;

//* Laravel Imports
use Illuminate\Http\JsonResponse;

O mesmo vale no frontend:

//* Components Imports
import Button from "@/components/ui/button";

import Link from "next/link";

Está errado.

O correto é:

//* Components Imports
import Button from "@/components/ui/button";

//* Libraries Imports
import Link from "next/link";

Todo import deve pertencer visualmente a um bloco nomeado.

40. Regra principal

Todo arquivo deve responder rapidamente:

O que esse arquivo faz?
Quais dependências ele possui?
Qual responsabilidade ele tem?
Onde está sua regra principal?
Qual camada deve chamar este código?

No frontend:

UI
↓
Hook
↓
Service
↓
API

Na API:

Route
↓
Request
↓
Controller
↓
Service / Model
↓
Database

A consistência é mais importante que quantidade de comentários.

Os comentários existem para tornar a estrutura clara, não para explicar código que já é autoexplicativo.
