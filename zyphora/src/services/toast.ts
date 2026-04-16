import { toast } from 'sonner';

let lastToastTime = 0;
let lastToastMessage = '';
const TOAST_COOLDOWN = 1000; // 1 second cooldown

export const showToast = {
    success: (message: string) => {
        // Prevent duplicate toasts
        const now = Date.now();
        if (now - lastToastTime < TOAST_COOLDOWN && lastToastMessage === message) {
            return;
        }

        lastToastTime = now;
        lastToastMessage = message;

        // Dismiss any existing toasts
        toast.dismiss();

        // Show new toast
        toast.success(message, {
            duration: 3000,
            position: 'bottom-right',
        });
    },

    error: (message: string) => {
        const now = Date.now();
        if (now - lastToastTime < TOAST_COOLDOWN && lastToastMessage === message) {
            return;
        }

        lastToastTime = now;
        lastToastMessage = message;

        toast.dismiss();
        toast.error(message, {
            duration: 3000,
            position: 'bottom-right',
        });
    },

    info: (message: string) => {
        const now = Date.now();
        if (now - lastToastTime < TOAST_COOLDOWN && lastToastMessage === message) {
            return;
        }

        lastToastTime = now;
        lastToastMessage = message;

        toast.dismiss();
        toast.info(message, {
            duration: 3000,
            position: 'bottom-right',
        });
    },

    warning: (message: string) => {
        const now = Date.now();
        if (now - lastToastTime < TOAST_COOLDOWN && lastToastMessage === message) {
            return;
        }

        lastToastTime = now;
        lastToastMessage = message;

        toast.dismiss();
        toast.warning(message, {
            duration: 3000,
            position: 'bottom-right',
        });
    },
};