import React, { useEffect, useState, useMemo } from "react";
import api from "../../utils/api";
import {
    Search,
    Edit,
    Trash2,
    Plus,
    ChevronLeft,
    ChevronRight,
    Loader2,
    Eye,
} from "lucide-react";
import Swal from "sweetalert2";
import { Link, useParams } from "react-router-dom";


const GivePermission = () => {
    const { id } = useParams()
    return (
        <div>GivePermission</div>
    )
}

export default GivePermission