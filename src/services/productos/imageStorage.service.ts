import { supabase } from '@/api/supabase'

const BUCKET = 'imagenes-productos'

export class ImageStorageService {

    static async uploadProductImage(file: File): Promise<string> {

        // nombre único
        const extension = file.name.split('.').pop()

        const fileName = `${Date.now()}-${crypto.randomUUID()}.${extension}`

        const { error } = await supabase.storage
            .from(BUCKET)
            .upload(fileName, file)

        if (error) {
            console.log(error);
            throw error
        }

        const { data } = supabase.storage
            .from(BUCKET)
            .getPublicUrl(fileName)

        return data.publicUrl
    }

}