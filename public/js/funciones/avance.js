import Swal from 'sweetalert2';

export const actualizarAvance = () => {
    //seleccionar tareas existentes
    const tareas = document.querySelectorAll('li.tarea');
    
    if(tareas.length){
        //seleccionar tareas completadas
        const completadas = document.querySelectorAll('i.completo');

        //calcular avance
        const avance = Math.round((completadas.length / tareas.length) * 100);

        console.log(avance);
        //mostrar avance
        const porcentaje= document.querySelector('#porcentaje');
        porcentaje.style.width= avance+'%';

        if(avance===100){
            Swal.fire(
                'Proyecto completado',
                'Felicidades, has terminado todas tus tareas',
                'success'
            );
        }
    }
    
}