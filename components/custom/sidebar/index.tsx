"use client"

//* Libraries Imports
import Image from "next/image"

//* Constants Imports
import { itemsForRole } from "@/constants"

//* Components Imports
import { Item } from "./item"

export function Navbar() {

    const typeUser = "admin" // TODO: pegar do contexto do usuário logado

    return (
        <div className="h-screen w-[280px] p-2 z-20">
            <div className="bg-foreground
             h-full w-full rounded-2xl p-5 text-background justify-start items-start">
                <div className="flex justify-center items-center gap-2 w-full p-5">
                    <Image src={'/favicon.ico'} alt="Logo" width={40} height={40} />
                    <h1>Nome do Projeto</h1>
                </div>
                <div className="flex flex-col gap-2 pt-10">
                    {itemsForRole[typeUser]?.map((role) => (
                        <Item key={role.label} role={role} />
                    ))}
                </div>

            </div>
        </div>
    )
}
