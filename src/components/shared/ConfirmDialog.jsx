import Swal from 'sweetalert2';

/**
 * Custom wrapper for SweetAlert2 confirm dialog
 */
export const confirmDialog = async ({ title, text, icon = 'warning', confirmText = 'Yes, delete it!', cancelText = 'Cancel' }) => {
    const result = await Swal.fire({
        title: title || 'Are you sure?',
        text: text || "You won't be able to revert this!",
        icon: icon,
        showCancelButton: true,
        confirmButtonColor: '#0ea5e9', // primary-600
        cancelButtonColor: '#64748b', // secondary-500
        confirmButtonText: confirmText,
        cancelButtonText: cancelText,
        reverseButtons: true,
        customClass: {
            popup: 'rounded-2xl',
            confirmButton: 'rounded-lg px-4 py-2 font-medium',
            cancelButton: 'rounded-lg px-4 py-2 font-medium',
        }
    });

    return result.isConfirmed;
};

/**
 * Success/Error alerts
 */
export const showAlert = ({ title, text, icon = 'success' }) => {
    return Swal.fire({
        title,
        text,
        icon,
        timer: 2000,
        showConfirmButton: false,
        customClass: {
            popup: 'rounded-2xl',
        }
    });
};
