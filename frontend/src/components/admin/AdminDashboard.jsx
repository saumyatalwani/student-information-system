import { Link } from "react-router-dom"
import {ArrowUpRightIcon} from '@primer/octicons-react'

export default function AdminDashboard(){

    return (
        <div className="pl-10 pt-5">
            <h1 className="text-6xl font-bold mb-5">Welcome, Administrator 👋🏻</h1>
            <div className="flex flex-col">
            <Link className="inline-flex items-center font-medium" to="/admin/add/student">
                Add Student <ArrowUpRightIcon size={20} className="ml-1" />
            </Link>

            <Link className="inline-flex items-center font-medium" to={'/admin/add/faculty'}>
                Add Faculty <ArrowUpRightIcon size={20} className="ml-1" />
            </Link>
                
            <Link to={'/admin/add/class'} className="inline-flex items-center font-medium">
                Add Class <ArrowUpRightIcon size={20} className="ml-1" />
            </Link>
                
            <Link to={'/admin/generate'} className="inline-flex items-center font-medium">
                Generate <ArrowUpRightIcon size={20} className="ml-1" />
            </Link>
            </div>
        </div>
    )
}