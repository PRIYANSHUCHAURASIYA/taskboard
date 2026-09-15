function Spinner({ size = "mb" }){
    const sizes = {
        sm: "h-4 w-4 border-2",
        md:"h-8 w-8 border-2",
        lg :"h-12 w-12 border-4"
    };
    return (
        <div className="flex justify-center items-center py-6">
            <div
                className={`${sizes[size]} border-blue-600 border-t-transparent rounded-full animate-spin`}>
                </div>
        </div>
    );
}
export default Spinner;
