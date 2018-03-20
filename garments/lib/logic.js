'use strict';
/**
 * transction processor functions here
 */

 /**
  * @param {org.reo.garments.products.Deal} deal
 * @transaction
 */

function deal(deal) {
    var factory = getfactory();
    var ns = 'org.reo.garments.participants'
 
    //creating rawsupplier
    var rawsupplier = factory.newResource(ns,'RawSupplier', 'RS001');
    
    rawsupplier.emailId = 'ramu@gupta.com'
    
    var rawsupplierInfo = factory.newConcept(ns, 'ParticipantInfo');
    rawsupplierInfo.firstName = "Ramu";
    rawsupplierInfo.lastName = "Gupta";
    
    var rawsupplierAddress = factory.newConcept(ns, 'Address');
    rawsupplierAddress.state = 'UP';
    rawsupplierAddress.city = 'Lucknow';
    rawsupplierAddress.pincode = '562001'
    
    rawsupplierInfo.address = rawsupplierAddress;
    rawsupplier.participantinfo = rawsupplierInfo;
    
    //creating manufacturer
    var manufacturer = factory.newResource(ns,'Manufacturer', 'M001');
    
    manufacturer.emailId = 'manu@gupta.com'
    
    var manufacturerInfo = factory.newConcept(ns, 'ParticipantInfo');
    manufacturerInfo.firstName = "Manu";
    manufacturerInfo.lastName = "Gupta";
    
    var manufacturerAddress = factory.newConcept(ns, 'Address');
    manufacturerAddress.state = 'Rajasthan';
    manufacturerAddress.city = 'Jodhpur';
    manufacturerAddress.pincode = '342001'
    
    manufacturerInfo.address = manufacturerAddress;
    manufacturer.participantinfo = manufacturerInfo;
 
    
    //creating distributor
    var distributor = factory.newResource(ns,'Distributor', 'D001');
    
    distributor.emailId = 'deepak@gupta.com'
    
    var distributorInfo = factory.newConcept(ns, 'ParticipantInfo');
    distributorInfo.firstName = "Deepak";
    distributorInfo.lastName = "Gupta";
    
    var distributorAddress = factory.newConcept(ns, 'Address');
    distributorAddress.state = 'MP';
    distributorAddress.city = 'Bhopal';
    distributorAddress.pincode = '872001'
    
    distributorInfo.address = distributorAddress;
    distributor.participantinfo = distributorInfo;  
 
    //creating contract
    var nsp = 'org.reo.garments.products';
    
    var contract = factory.newResource(nsp, 'Contract', 'CTR001');
    contract.dateOfContract = deal.timestamp();
    contract.ratePerUnit = 21.0;
    contract.rawsupplier=factory.newRelationship(ns,'RawSupplier', 'RS001');
    contract.manufacturer=factory.newRelationship(ns,'Manufacturer','M001');
    contract.distributor=factory.newRelationship(ns,'Distributor', 'D001');
 
    //creating delivery asset
    var delivery = factory.newResource(nsp, 'Delivery', 'DRY_001');
    delivery.type = 'Suit';
    delivery.progress = 'CREATED';
    delivery.itemCount = 100;
    delivery.contract = factory.newRelationship(nsp, 'Contract', 'CTR001');
 
    //deploying promises
    return getParticipantRegistry(ns + '.RawSupplier')
         .then(function (rawsupplierRegistry) { return rawsupplierRegistry.addAll([rawsupplier]);})
         .then(function() { return getParticipantRegistry(ns + '.Manufacturer'); })
         .then(function(manufacturerRegistry) { return manufacturerRegistry.addAll([manufacturer]);})
         .then(function() { return getParticipantRegistry(ns + '.Distributor'); })
         .then(function(distributorRegistry) { return distributorRegistry.addAll([distributor]); })
         .then(function() { return getAssetRegistry(nsp + '.Contract'); })
         .then(function(contractRegistry) { return contractRegistry.addAll([contract]);})
         .then(function() { return getAssetRegistry(nsp + '.Delivery'); })
         .then(function(deliveryRegistry) { return deliveryRegistry.addAll([delivery]);});
 }

/**
 * @param {org.reo.garments.products.fundsTransfer} payment 
 * @transaction
 */

function payment(payment){
    var delivery = payment.delivery;
    var contract = delivery.contract;
    var bill = contract.ratePerUnit * delivery.itemCount;

    delivery.progress = 'ARRIVED';
    console.log("Bill: "+ bill);

    console.log('RawSupplier: ' + contract.rawsupplier.$identifier);
    console.log('Manufacturer: ' + contract.manufacturer.$identifier);

    return getParticipantRegistry('org.reo.garments.participants.RawSupplier')
        .then(function (rawsupplierRegistry) {return rawsupplierRegistry.update(contract.rawsupplier);})
    .then(function () {return getParticipantRegistry('org.reo.garments.participants.Manufacturer');})
        .then(function (manufacturerRegistry) {return manufacturerRegistry.update(contract.manufacturer);})
    .then(function () { return getAssetRegistry('org.reo.garments.products.Delivery');})
        .then(function (deliveryRegistry) {var deliveryNotification = getFactory().newEvent('org.reo.garments.products', 'deliveryRecieved');
        deliveryNotification.delivery = delivery; emit(deliveryNotification);
        return deliveryRegistry.update(delivery);});
}

