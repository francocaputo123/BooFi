export const handleImageVerification = (blob : Blob) => {
    
    const bytes = blob.size

    const megas = bytes / (1024 * 1024)

    if(megas > 1) {
        return({
            status : "error",
            message : "El peso es superior a 1 mb. Cambia la configuracion."
        })
    }

    

    return
}