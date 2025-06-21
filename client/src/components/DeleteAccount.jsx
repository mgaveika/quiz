export default function DeleteAccount(props) {
    return (
        <div className="bg-[#000000ab] fixed inset-0 z-[9999] flex h-full w-full items-center justify-center">
            <div className="relative w-md rounded-2xl bg-white p-10">
                <h2 className="text-center font-bold text-[25px]">Are you sure you want to delete your account?</h2>
                <p className="text-center pt-2">After confirmation you will not be able to restore it.</p>
                <div className="flex justify-between mt-9">
                    <button onClick={props.confirm} className="w-40 cursor-pointer rounded-md bg-red-600 py-2 text-white hover:bg-red-700">Delete account</button>
                    <button onClick={props.cancel} className="w-40 cursor-pointer rounded-md border border-gray-300 py-2 text-gray-700 hover:bg-gray-100">Cancel</button>
                </div>
            </div>
        </div>
    )
}