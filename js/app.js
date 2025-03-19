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
    const modalForm = document.querySelector('#formulario');
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
            cleanHTML( '#resumen .contenido' );
            
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
    resume.classList.add('col-md-6', 'card', 'py-2', 'px-3', 'shadow');

    // Info table
    const table = document.createElement('LI');
    table.textContent = 'Mesa: '
    table.classList.add('fw-bold')

    const tableSpan = document.createElement('SPAN');
    tableSpan.textContent = client.table;
    tableSpan.classList.add('fw-normal');
    // info hour
    const hour = document.createElement('LI');
    hour.textContent = 'Hora: '
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
        list.classList.add(`list-group-item-${ id }`);
        
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
        
        // BTN DELETE
        const btnDelete = document.createElement('button');
        btnDelete.classList.add('btn', 'btn-danger')
        btnDelete.textContent = 'Eliminar del pedido'
        
        // function for delete the delivery
        btnDelete.onclick = () => {
            deleteProduct(id);
            cleanHTML( `.list-group-item-${ id }`, true );
            calculateTip();
        }

        // add values to conteiners
        priceEl.appendChild( priceValue );
        quantityEl.appendChild( quantityValue );
        subtotalEl.appendChild(subtotalValue);

        // add elements to li
        list.append( nameEl, quantityEl, priceEl, subtotalEl, btnDelete );

        // add list to principal group
        group.appendChild( list );
  
    })

    resume.append( heading, table, hour, group )
    content.append( resume );

    // Show tips form
    formTips();
}

function cleanHTML( selector, removeSelector = false ) {
    const content = document.querySelector( selector );
    console.log( content )

    if( removeSelector ) return content.remove();
    while( content?.firstChild ) {
        content.removeChild( content.firstChild );
    }
}

const calcSubtotal = ( price, quantity ) => `$ ${ price * quantity }`;

const deleteProduct = id => {
    // console.log( id )
    client.order = client.order.filter( i => i.id !== id );
    const inputQuantity = document.querySelector(`#producto-${ id }`);
    inputQuantity.value = 0;

}

function formTips() {

    const content = document.querySelector('#resumen .contenido');

    const form = document.createElement('div');
    form.classList.add('col-md-6', 'form');

    const divForm = document.createElement('div');
    divForm.classList.add('card', 'py-2', 'px-3', 'shadow');

    const heading = document.createElement('h3');
    heading.classList.add('my-4', 'text-center');
    heading.textContent = 'Propina';
    // 25%
    const radio10 = document.createElement('input')
    radio10.type = 'radio';
    radio10.name = 'propina';
    radio10.value = '10';
    radio10.classList.add('form-check-input');
    radio10.onclick = calculateTip;
    
    const radio10Label = document.createElement('label')
    radio10Label.textContent = '10%'
    radio10Label.classList.add('form-check-label')
    
    const radio10Div = document.createElement('div')
    radio10Div.classList.add('form-check')
    
    radio10Div.append( radio10, radio10Label )
    
    // 25%
    const radio25 = document.createElement('input')
    radio25.type = 'radio';
    radio25.name = 'propina';
    radio25.value = '25';
    radio25.classList.add('form-check-input');
    radio25.onclick = calculateTip;
    
    const radio25Label = document.createElement('label')
    radio25Label.textContent = '25%'
    radio25Label.classList.add('form-check-label')
    
    const radio25Div = document.createElement('div')
    radio25Div.classList.add('form-check')
    
    radio25Div.append( radio25, radio25Label )
    
    // 50%
    const radio50 = document.createElement('input')
    radio50.type = 'radio';
    radio50.name = 'propina';
    radio50.value = '50';
    radio50.classList.add('form-check-input');
    radio50.onclick = calculateTip;

    const radio50Label = document.createElement('label')
    radio50Label.textContent = '50%'
    radio50Label.classList.add('form-check-label')

    const radio50Div = document.createElement('div')
    radio50Div.classList.add('form-check')

    radio50Div.append( radio50, radio50Label )

    
    // add in pricipal div
    divForm.append( heading, radio10Div, radio25Div, radio50Div )
    form.appendChild( divForm )

    // add in form
    content.appendChild( form );

};

function calculateTip(){
    const { order } = client;
    let subtotal = 0;
    let total = 0;
    const tipPercentage = document.querySelector('input[name="propina"]:checked')?.value;
    console.log( tipPercentage)
    
    order.forEach( ({ cantidad, precio }) => subtotal += cantidad * precio )
    
    if ( tipPercentage === '10' ) total = Math.round(( subtotal * 110 ) / 100);
    if ( tipPercentage === '25' ) total = Math.round(( subtotal * 125 ) / 100);
    if ( tipPercentage === '50' ) total = Math.round(( subtotal * 150 ) / 100);
    
    let tip = Math.round(total - subtotal);
    showTotalHTML( subtotal, total, tip);  
    
}

function showTotalHTML( subtotal, total, tip){
    cleanHTML('.total-pagar');
    // selectors
    const form = document.querySelector('.form > div')
    let divTotales = document.querySelector('.total-pagar')
    if( !divTotales ) {
        divTotales = document.createElement('div')
    }
    if( divTotales )
    divTotales.classList.add('total-pagar')

    
    // subtotal
    const subtotalParagraph = document.createElement('p');
    subtotalParagraph.classList.add('fs-3', 'fw-bold', 'mt-5');
    subtotalParagraph.textContent = 'Subtotal Consumo: ';

    const subtotalSpan = document.createElement('span');
    subtotalSpan.classList.add('fw-normal');
    subtotalSpan.textContent = `$${ subtotal }`;

    subtotalParagraph.appendChild( subtotalSpan )
    
    // tip
    const tipParagraph = document.createElement('p');
    tipParagraph.classList.add('fs-3', 'fw-bold', 'mt-5');
    tipParagraph.textContent = 'Propina: ';

    const tipSpan = document.createElement('span');
    tipSpan.classList.add('fw-normal');
    tipSpan.textContent = `$${ tip }`;

    tipParagraph.appendChild( tipSpan )
    
    // total
    const totalParagraph = document.createElement('p');
    totalParagraph.classList.add('fs-3', 'fw-bold', 'mt-5');
    totalParagraph.textContent = 'Total: ';

    const totalSpan = document.createElement('span');
    totalSpan.classList.add('fw-normal');
    totalSpan.textContent = `$${ total }`;

    totalParagraph.appendChild( totalSpan )


    
    divTotales.append( subtotalParagraph, tipParagraph, totalParagraph )
    
    form.appendChild( divTotales )
    
};