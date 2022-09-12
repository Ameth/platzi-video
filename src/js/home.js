// console.log("Hola mundo")
// const noCambia = "Ameth"
// let cambia = "Hola"


// function cambiarNombre(nuevoNombre){
//   cambia = nuevoNombre
// }

// const obtenerUsuario = new Promise(function(todoBien, todoMal){
//   //Llamar a un api
//   setTimeout(() => {
//     todoBien('Se acabó el tiempo en 3s')
//   }, 3000);
// })

// const obtenerUsuarioTodos = new Promise(function(todoBien, todoMal){
//   //Llamar a un api
//   setTimeout(() => {
//     todoBien('Se acabó el tiempo en 5s')
//   }, 5000);
// })

// obtenerUsuario
//   .then(function(){
//     console.log("Todo va bien hasta ahora")
//   })
//   .catch(function(mensaje){
//     console.log(mensaje + ". Todo mal :(")
//   })


//   Promise.race([obtenerUsuario, obtenerUsuarioTodos])
//   .then(function(mensaje){
//     console.log(mensaje)
//   })
//   .catch(function(mensaje){
//     console.log(mensaje)
//   })

  // $.ajax(
  //   'https://randomuser.me/api/',
  //   {
  //     method: 'GET',
  //     success: function(data){
  //       console.log(data)
  //     },
  //     error:function(error){
  //       console.log(`Error ${error.status}: ${error.responseText}`)
  //     }
  //   }
  // )

  // fetch('https://randomuser.me/api/ddd')
  //   .then(function(respuesta){
  //     // console.log(respuesta)
  //     return respuesta.json()
  //   })
  //   .then(function(usuario){
  //     console.log('usuario', usuario.results[0].name.first)
  //   })
  //   .catch(function(error){
  //     console.log(error)
  //   })

  async function cargar(){
    //await
    const urlmovies = 'https://yts.mx/api/v2/list_movies.json?'
    const contenedorAccion = document.getElementById('action')
    const contenedorDrama = document.getElementById('drama')
    const contenedorAnimacion = document.getElementById('animation')
    
    const contenedorfeaturing = document.getElementById('featuring')
    const form = document.getElementById('form')
    const home = document.getElementById('home')
  
    const overlay = document.getElementById('overlay')
    const modal = document.getElementById('modal')
    const hideModal = document.getElementById('hide-modal')
    //Modal
    const modalTitulo = modal.querySelector('h1')
    const modalImagen = modal.querySelector('img')
    const modalDescripcion = modal.querySelector('p')

    async function obtenerDatos(url){
      const respuesta = await fetch(url)
      const datos = await respuesta.json()
      if(datos.data.movie_count > 0){
        return datos
      }
      throw new Error('No se encontró ningun resultado')
    }

    function videoItemTemplate(pelicula, tipo){
      return `<div class='primaryPlaylistItem' data-id="${pelicula.id}" data-categoria="${pelicula.genres.join(", ")}" data-tipo="${tipo}">
      <div class='primaryPlaylistItem-image'>
        <img src='${pelicula.medium_cover_image}' />
      </div>
      <h4 class='primaryPlaylistItem-title'>${pelicula.title_long}</h4>
    </div>`
    }
  
    function crearElementoHTML(HTMLString){
      const html = document.implementation.createHTMLDocument()
      html.body.innerHTML = HTMLString
      return html.body.children[0]
    }
  
    function renderListaPeliculas(lista, contenedor, tipo){
      contenedor.children[0].remove()
      lista.forEach(pelicula => {
        const HTMLString = videoItemTemplate(pelicula, tipo)
        const movieElement = crearElementoHTML(HTMLString)
        contenedor.append(movieElement)
        const img = movieElement.querySelector('img')
        img.addEventListener('load',(event) =>{
          //event.srcElement.classList.add('fadeIn')
          //Es lo mismo que esto
          img.classList.add('fadeIn')
        })        
        addEventClick(movieElement)
        // console.log(pelicula.title_long)
      });
    }
  
    function addEventClick(elemento){
      elemento.addEventListener('click', () => {
        mostrarModal(elemento)
      })
    }
  
    function mostrarModal(elemento){
      overlay.classList.add('active')
      modal.style.animation = 'modalIn .8s forwards'
      const id = elemento.dataset.id
      const categoria = elemento.dataset.categoria
      const datosPelicula = encontrarPelicula(id, elemento.dataset.tipo)
      modalTitulo.textContent = datosPelicula.title_long
      modalImagen.src = datosPelicula.medium_cover_image
      modalDescripcion.textContent = datosPelicula.synopsis
    }
  
    function ocultarModal(){
      overlay.classList.remove('active')
      modal.style.animation = 'modalOut .8s forwards'
    }
  
    function encontrarId(lista, id){      
      return lista.find(pelicula => pelicula.id === parseInt(id))
    }
  
    function encontrarPelicula(id, tipo){
      switch (tipo){
        case 'accion': {
          return encontrarId(listaAccion, id)
        }
        case 'drama': {
          return encontrarId(listaDrama, id)
        }
        default: {
          return encontrarId(listaAnimacion, id)
        }
      }    
    }
  
    function mostrarCuadroBusqueda(pelicula){
      return `
      <div class="featuring" style="background-image: url('${pelicula.background_image}');">
        <div class="featuring-image">
          <img src="${pelicula.medium_cover_image}" width="70" height="100" />
        </div>
        <div class="featuring-content">
          <p class"featuring-title">${pelicula.title_long}</p>
          <p class"featuring-album">${pelicula.synopsis}</p>
        </div>
      </div>`
    }
  
    hideModal.addEventListener('click',ocultarModal)

    function ponerAtributos(elemento, parametros){
      for(let attributo in parametros){
        elemento.setAttribute(attributo, parametros[attributo])
      }
    }

    form.addEventListener('submit', async (evento)=>{
      evento.preventDefault()
      home.classList.add('search-active')
      const loader = document.createElement('img')
      ponerAtributos(loader, {
        src: 'src/images/loader.gif',
        height: 50,
        width: 50
      })
      contenedorfeaturing.append(loader)

      const data = new FormData(form)
      try{
        const {
          data: {
            movies: pelicula
          }
        } = await obtenerDatos(`${urlmovies}limit=1&query_term=${data.get('name')}`)
        const htmlResultadoBusq = mostrarCuadroBusqueda(pelicula[0])
        contenedorfeaturing.innerHTML = htmlResultadoBusq
      }catch(error){
        swal({
          title: "Error",
          text: error.message,
          icon: "error"
        });
        loader.remove()
        home.classList.remove('search-active')
      }      
      
    })

    async function existeCache(categoria, genero){
      const cacheList = window.localStorage.getItem(categoria)
      if(cacheList){
        // console.log(JSON.parse(cacheList))
        return JSON.parse(cacheList)
      }
      const {data:{movies: lista}} = await obtenerDatos(urlmovies+'genre='+genero)
      window.localStorage.setItem(categoria,JSON.stringify(lista))
      return lista
    }
    const listaAccion = await existeCache('listaAccion', 'action')
    const listaDrama = await existeCache('listaDrama', 'drama')
    const listaAnimacion = await existeCache('listaAnimacion', 'animation')
    

    // const {data:{movies: listaAccion}} = await obtenerDatos(urlmovies+'genre=action')
    // window.localStorage.setItem('listaAccion',JSON.stringify(listaAccion))
    renderListaPeliculas(listaAccion,contenedorAccion, 'accion')

    // // const {data:{movies: listaDrama}} = await obtenerDatos(urlmovies+'genre=drama')    
    // window.localStorage.setItem('listaDrama',JSON.stringify(listaDrama))
    renderListaPeliculas(listaDrama,contenedorDrama, 'drama')

    // // const {data:{movies: listaAnimacion}} = await obtenerDatos(urlmovies+'genre=animation')
    // window.localStorage.setItem('listaAnimacion',JSON.stringify(listaAnimacion))
    renderListaPeliculas(listaAnimacion,contenedorAnimacion, 'animacion')   

    // obtenerDatos('https://yts.mx/api/v2/list_movies.json?genre=animation')
    //   .then(function(datos){
    //     console.log('listaAnimacion', datos)
    //   })

    // const listaPrueba = await obtenerDatos(urlmovies+'genre=action')
    // console.log('listaPrueba',listaPrueba)
    // console.log('listaAnimacion',listaAnimacion)
    // console.log('listaDrama',listaDrama)

  }

  cargar()

  

  