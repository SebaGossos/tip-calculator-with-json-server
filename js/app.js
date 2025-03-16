let client = {
    table: '',
    hour: '', 
    order: [],
};

const btnSaveClient = document.querySelector('#guardar-cliente');
btnSaveClient.addEventListener('click', saveClient);


function saveClient() {
    
    const table = document.querySelector('#mesa').value;
    const hour = document.querySelector('#hora').value;

    // check if are empty fields
    const isEmptyFields = [ table, hour ].some( data => data.trim() === '' );
    if (isEmptyFields) {
        const alertExist = document.querySelector('.invalid-feedback')
        if( alertExist ) alertExist.remove();
            
        const alerta = document.createElement('DIV');
        alerta.classList.add('invalid-feedback', 'd-block', 'text-center');
        alerta.textContent = 'Todos los campos son obligatorios';
        
        document.querySelector('.modal-body form').appendChild( alerta );
        setTimeout(() => {alerta.remove()}, 3000)

        return;
    }

    // Asign data form to client
    client = { ...client, table, hour }

    // hide modal
    const modalForm = document. querySelector('#formulario');
    const modalBootstrap = bootstrap.Modal.getInstance( modalForm );
    modalBootstrap.hide();

    // Show sections
    showSections();


    // get dishes from the json api
    getDishes();
    
};

function showSections() {
    const sectionsHidden = document.querySelectorAll('.d-none');
    sectionsHidden.forEach(section => section.classList.remove('d-none'));
}

function getDishes() {
    const url = `http://localhost:4000/platillos`;

    fetch( url )
        .then( res => res.json() )
        .then( res => showDishes( res ))
        .catch( err => console.log( err ))

}

function showDishes( dishes ) {
    const content = document.querySelector('#platillos .contenido');
    const hasDishes = document.querySelector('.row');
    if( hasDishes ) {
        hasDishes.remove()
    }

    dishes.forEach( dish => {

        const row = document.createElement('DIV');
        row.classList.add('row', 'py-3', 'border-top');

        const name = document.createElement('DIV');
        name.classList.add('col-md-4');
        name.textContent = dish.nombre;        

        const price = document.createElement('DIV');
        price.classList.add('col-md-3', 'fw-bold');
        price.textContent = dish.precio;

        const category = document.createElement('DIV');
        category.classList.add('col-md-3');
        category.textContent = dish.categoria;
        
        row.append( name, price, category );
        content.append( row );
    }) 
}