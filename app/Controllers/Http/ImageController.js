'use strict'
const Helpers = use('Helpers')
const Image = use('App/Models/Image')
const Property = use('App/Models/Property')


class ImageController {
  /**
   * Create/save a new image
   * Post Images
   */

  async show ({ params, request}){
    return request.download(Helpers.tmpPath(`uploads/${params.path}`))
  }

  async store ({params, request }) {
        const property = await Property.findOrFail(params.id)

    const images = request.file('image', {
      types: ['image'],
      size: '2mb'
    })
    //Renomeia as imagens e salvas as em uma pasta uploads
    await images.moveAll(Helpers.tmpPath('uploads'), file => ({
      name: `${Date.now()}-${file.clientName}`
    }))
    //verifica se houve erros ao tentar salva se houve retorna os erros
    if(!images.moveAll()) {
      return images.errors()
    }

    // Cria os registros de imagens no banco de dados, associando com o imovel
    await  Promise.all(
      images
          .movedList()
          .map(image => property.image().create({ path: image.fileName}))
    )


  }
}


module.exports = ImageController
