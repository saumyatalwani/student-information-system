import { AlertFillIcon } from "@primer/octicons-react"

export default function Unauthorized(){

    return (
        <div className="flex items-center justify-center flex-col h-screen">
            <AlertFillIcon size={240}/>
            <h1 className="text-6xl my-5">You're not allowed on this route!</h1>
        </div>
    )
}