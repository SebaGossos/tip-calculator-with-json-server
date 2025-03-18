let client = {
    table: '',
    hour: '', 
    order: [],
};

const categories = {
    1: 'Comidas',
    2: 'Bebidas',
    3: 'Postres'
}

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
    const hasDishes = document.querySelector('.row-special');
    if( hasDishes ) {
        hasDishes.remove()
    }

    dishes.forEach( dish => {

        const row = document.createElement('DIV');
        row.classList.add('row-special', 'row', 'py-3', 'border-top');

        const name = document.createElement('DIV');
        name.classList.add('col-md-4');
        name.textContent = dish.nombre;        

        const price = document.createElement('DIV');
        price.classList.add('col-md-3', 'fw-bold');
        price.textContent = dish.precio;

        const category = document.createElement('DIV');
        category.classList.add('col-md-3');
        category.textContent = categories[dish.categoria];

        const inputQuantity = document.createElement('INPUT');
        inputQuantity.type = 'number';
        inputQuantity.min = 0;
        inputQuantity.id = `producto-${ dish.id }`;
        inputQuantity.value = 0;
        inputQuantity.classList.add('form-control');
        

        // Function that detects the quantity and the dish being delivered
        inputQuantity.onchange = () => {
            const cantidad = parseInt( inputQuantity.value );
            addDishes( {...dish, cantidad } )
            // Clean previous HTML code 
            cleanHTML();
            
            // show resume
            updateResume();
        };

        const add = document.createElement('DIV');
        add.classList.add('col-md-2');
        add.appendChild( inputQuantity );
        
        row.append( name, price, category, add );
        content.append( row );
    }) 
}

function addDishes( product ) {
    // Extract the current order 
    let { order } = client; 
    
    // Check that the amount is grater than 0
    if ( product.cantidad < 0 ) {
        console.log( 'Error is less than or equal to 0' )
        return;
    }

    // Check if element is alredy exist in array, if not adding in order.
    if( !order.some( p => p.id === product.id ) ) {
        client.order = [ ...order, product ]
        return;
    }
    
    // If is equal to 0 delete from order array
    if( product.cantidad === 0 ) {
        client.order = order.filter( p => p.id !== product.id );
        return;
    }

    client.order = order.map( p => {
        if( p.id === product.id ) p.cantidad = product.cantidad;
        return p;
    })

}

function updateResume() {
    const content = document.querySelector('#resumen .contenido');
    const resume = document.createElement('DIV');
    resume.classList.add('col-md-6', 'card', 'py-5', 'px-3', 'shadow');

    // Info table
    const table = document.createElement('LI');
    table.textContent = 'Mesa: '
    table.classList.add('fw-bold')

    const tableSpan = document.createElement('SPAN');
    tableSpan.textContent = client.table;
    tableSpan.classList.add('fw-normal');
    // info hour
    const hour = document.createElement('LI');
    hour.textContent = 'Mesa: '
    hour.classList.add('fw-bold')

    const hourSpan = document.createElement('SPAN');
    hourSpan.textContent = client.hour;
    hourSpan.classList.add('fw-normal');

    // add to father element
    table.appendChild( tableSpan );
    hour.appendChild( hourSpan );

    // heading  section
    const heading = document.createElement('H3');
    heading.textContent = 'Platillos Consumidos'
    heading.classList.add('my-4', 'text-center')

    // iterate array delivery
    const group = document.createElement('UL');
    group.classList.add('list-group');
    
    const { order } = client;
    order.forEach( i => {
        const { nombre, cantidad, precio, id } = i;

        const list = document.createElement('li');
        list.classList.add('list-group-item');
        
        const nameEl = document.createElement('h4');
        nameEl.classList.add('my-4');
        nameEl.textContent = nombre;

        // quantity article
        const quantityEl = document.createElement('p');
        quantityEl.classList.add('fw-bold');
        quantityEl.textContent = 'Cantidad: ';

        const quantityValue = document.createElement('SPAN');
        quantityValue.classList.add('fw-normal');
        quantityValue.textContent = cantidad;

        // price article
        const priceEl = document.createElement('p');
        priceEl.classList.add('fw-bold');
        priceEl.textContent = 'Precio: ';

        const priceValue = document.createElement('SPAN');
        priceValue.classList.add('fw-normal');
        priceValue.textContent = `$${ precio }`;

        // subtotal  article
        const subtotalEl = document.createElement('p');
        subtotalEl.classList.add('fw-bold');
        subtotalEl.textContent = 'Subtotal: ';

        const subtotalValue = document.createElement('SPAN');
        subtotalValue.classList.add('fw-normal');
        subtotalValue.textContent = calcSubtotal(precio, cantidad);

        // add values to conteiners
        priceEl.appendChild( priceValue );
        quantityEl.appendChild( quantityValue );
        subtotalEl.appendChild(subtotalValue);

        // add elements to li
        list.append( nameEl, quantityEl, priceEl, subtotalEl );

        // add list to principal group
        group.appendChild( list );
        
        
    })

    resume.append( table, hour, heading, group )
    content.append( resume );
}

function cleanHTML() {
    const content = document.querySelector('#resumen .contenido');
    while( content.firstChild ) {
        content.removeChild( content.firstChild );
    }
}

const calcSubtotal = ( price, quantity ) => `$ ${ price * quantity }`;