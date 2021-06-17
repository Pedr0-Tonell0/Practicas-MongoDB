
// Punto 1

// Recuperar informacion de la tabla de sales

// a. Filtrar las storeLocation de "London"

// b. Mostrar los siguientes datos:

// * saleDate

// * items

// * storeLocation

// * customer

// * purchaseMethod

// c. Ocultar el campo _id

// d. Ordenar en forma ascendente por fecha de venta

db.sales.find(
    {
        storeLocation: 'London'
    },
    {
        saleDate:1,
        items:1,
        storeLocation:1,
        customer:1,
        purchaseMethod:1,
        _id:0
    }
    ).pretty().sort({saleDate:1})

    // Punto 2

    // Recuperar informacion de la tabla de sales
    
    // a. Filtrar las storeLocation de "New York", "Austin" y "Denver"
    
    // b. Filtrar registros completos que contengan los items de "binder" o "pens" para toda la compra.
    
    // c. Mostrar los siguientes datos:
    
    // * saleDate
    
    // * items
    
    // * storeLocation
    
    // * customer
    
    // * purchaseMethod
    
    // d. Ocultar el campo _id
    
    // e. Ordenar en forma ascendente por fecha de venta

    db.sales.find(
        {
           $or:[
               {
                   storeLocation: 'New York'
               },
               {
                   storeLocation: 'Austin'
               },
               {
                storeLocation: 'Denver'
               }
            ],
            $and:[
                {
                    items: { $elemMatch: {'name': {$in: ['binder','pens']} }}
                }
            ]        
        },
        {
            saleDate:1,
            items:1,
            storeLocation:1,
            customer:1,
            purchaseMethod:1,
            _id:0
        }
        ).pretty().sort({saleDate:1})


//         Punto 3

// Recuperar informacion de la tabla de sales

// a. Filtrar customer

// * En un rango de 30 a 40 años

// * Que hayan indicado en la "satisfaction", un puntaje mayor o igual a 3

// * De sexo masculino

// NOTA: Para filtrar atributos de objetos, se debe usar la sintaxis "objecto.atributo"

// b. Que hayan usado cupones de descuento.

// c. Mostrar los siguientes datos:

// * saleDate

// * items (solo los atributos "name" y "tags")

// * storeLocation

// * customer

// * purchaseMethod

// * couponUsed

// d. Ocultar el campo _id

// e. Ordenar en forma descendente por fecha de venta

db.sales.aggregate([
    { 
        $match: { 'customer.age': {$gte : 30,$lte:40},
                  'customer.satisfaction': {$gte : 3},
                  'customer.gender': {$eq : 'M'},
                  couponUsed: true                 
        } 
    },
    {
        $project:
        {
            saleDate:1,
            'items.name': 1,
            'items.tags':1,
            storeLocation:1,
            customer:1,
            purchaseMethod:1,
            couponUsed:1,
            _id:0
        }
    },
    {
        $sort: {
            saleDate: -1
        }
    }
  ]).pretty()

//   Punto 4

// a. Contabilizar la cantidad de ventas por genero de los clientes

// b. Ordenar los resultados de forma descendente por cantidad de ventas.

// c. La salida debe ser de la siguiente forma

// { "Genero" : "F", "Ventas" : 2527 }

// { "Genero" : "M", "Ventas" : 2473 }

db.sales.aggregate([
    {
        
            $group:	{
                _id: '$customer.gender',
                count: { $sum: 1} 
            }
        
    },
    {
        $project: {
            _id:0,
            Genero: '$_id',   
            Ventas: '$count'     
        }
    },
    {
        $sort:
        {
            Ventas: -1
        }
    }
  ]).pretty()

//   Punto 5

// a. Informar el porcentaje de ventas por genero de los clientes.

// b. Se puede desarrollar el ejercicio en dos consultas: Una para obtener el total de ventas de la coleccion y otra para el calculo de los porcentajes.

// c. Ordenar los resultados de forma descendente por cantidad de ventas.

// d. La salida debe ser de la siguiente forma:

// { "Genero" : "F", "Ventas" : 2527, "PorcVentas" : 0.5 }

// { "Genero" : "M", "Ventas" : 2473, "PorcVentas" : 0.49 }

// TOTAL
db.sales.aggregate([
    {
            $group:	{
                _id: null,
                count: { $sum: 1}            
            },
        
    },
    {
        $project: {
            _id:0,
            VentasTotales: '$count'     
        }
    },

  ]).pretty()

// PORCENTAJES

db.sales.aggregate([
    {
        
            $group:	{
                _id: '$customer.gender',
                count: { $sum: 1}
            }
        
    },
    {
        $project: {
            _id:0,
            Genero: '$_id',   
            Ventas: '$count',
            PorcVentas: {$trunc: [{$divide: ['$count', 5000]}, 2]}     
        }
    },
    {
        $sort:
        {
            Ventas: -1
        }
    }
  ]).pretty()

//   Punto 6

// a. Filtrar las storeLocation de "San Diego", "London" y "Austin"

// b. Calcular el total de ventas para la combinacion de "storeLocation" y "couponUsed"

// c. Ordenar por tienda

// d. La salida debe ser de la siguiente forma:

// { "TiendaMetodo" : { "Tienda" : "Austin", "UsoCupon" : false }, "TotalVentas" : 618 }

// { "TiendaMetodo" : { "Tienda" : "Austin", "UsoCupon" : true }, "TotalVentas" : 58 }

// { "TiendaMetodo" : { "Tienda" : "London", "UsoCupon" : false }, "TotalVentas" : 718 }

// { "TiendaMetodo" : { "Tienda" : "London", "UsoCupon" : true }, "TotalVentas" : 76 }

// { "TiendaMetodo" : { "Tienda" : "San Diego", "UsoCupon" : false }, "TotalVentas" : 319 }

// { "TiendaMetodo" : { "Tienda" : "San Diego", "UsoCupon" : true }, "TotalVentas" : 27 }

db.sales.aggregate([
    { 
        $match: {                
            storeLocation:{$in:['San Diego', 'London', 'Austin']},
            couponUsed:{$in:[true, false]}
        } 
    },
    {
        
            $group:	{
                _id: {
                    Tienda: '$storeLocation',
                    UsoCupon: '$couponUsed'
                },
                count: { $sum: 1} 
            }
        
    },
    {
        $project: {
            _id:0,
            TiendaMetodo: '$_id',
            UsoCupon:  '$couponUsed',  
            TotalVentas: '$count'     
        }
    },
    {
        $sort:
        {
            TiendaMetodo: 1  
        }
    }
  ]).pretty()
