import Swal from "sweetalert2";

class AlertService {

    success(title: string, text?: string) {
        return Swal.fire({
            icon: "success",
            title,
            text,
            confirmButtonText: "Aceptar"
        });
    }

    error(title: string, text?: string) {
        return Swal.fire({
            icon: "error",
            title,
            text,
            confirmButtonText: "Aceptar"
        });
    }

    warning(title: string, text?: string) {
        return Swal.fire({
            icon: "warning",
            title,
            text,
            confirmButtonText: "Aceptar"
        });
    }

    info(title: string, text?: string) {
        return Swal.fire({
            icon: "info",
            title,
            text,
            confirmButtonText: "Aceptar"
        });
    }

    async confirm(title: string, text?: string) {

        const result = await Swal.fire({

            title,
            text,
            icon: "question",

            showCancelButton: true,

            confirmButtonText: "Sí",
            cancelButtonText: "Cancelar",

            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33"

        });

        return result.isConfirmed;

    }

    toastSuccess(message: string) {

        return Swal.fire({
            toast: true,
            position: "top-end",
            icon: "success",
            title: message,
            showConfirmButton: false,
            timer: 2000,
            timerProgressBar: true
        });

    }

    toastError(message: string) {

        return Swal.fire({
            toast: true,
            position: "top-end",
            icon: "error",
            title: message,
            showConfirmButton: false,
            timer: 2000,
            timerProgressBar: true
        });

    }

}

export default new AlertService();