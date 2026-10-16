export interface StatusMessageProps {
    message: string;
    isLoading?: boolean;
    actionLabel?: string;
    onAction?: () => void;
}
