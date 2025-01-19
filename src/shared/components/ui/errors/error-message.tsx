type ErrorMessageProps = {
    message: string;
}

export const ErrorMessage = ({
    message 
}: ErrorMessageProps) => {
    return (
        <div className="flex items-center">
            <p className='text-2xl font-bold text-red-500'>{message}</p>
        </div>
    );
}