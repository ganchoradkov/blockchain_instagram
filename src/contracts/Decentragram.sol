pragma solidity ^0.5.0;

contract Decentragram {
  
  string public name = "Decentragram"; 

  // store images
  mapping(uint => Image) public images;
  uint public imageCount = 0;
  

  struct Image {
    uint id;
    string hash;
    string description;
    uint tipAmount;
    address payable author;
  }

  event ImageCreated(
    uint id,
    string hash,
    string description,
    uint tipAmount,
    address payable author
  );

  event ImageTipped( 
    uint id,
    string hash,
    string description,
    uint tipAmount,
    address payable author
  );

  // create images
  function uploadImage(string memory _imgHash, string memory _description) public {
    
    // make sure hash & description exists
    require(bytes(_imgHash).length > 0, 'hash cannot be empty');
    require(bytes(_description).length > 0, 'description cannot be empty');
    // make sure its valid uploader
    require(msg.sender != address(0x0), 'description cannot be empty');


    //increment imageCount
    imageCount++;
    
    // add image in images mapping
    images[imageCount] = Image(imageCount, _imgHash, _description, 0, msg.sender);

    //fire event
    emit ImageCreated(imageCount, _imgHash, _description, 0, msg.sender);
  }

  // tip images
  function tipImageOwner(uint _id) public payable {

    require(_id > 0 && _id <= imageCount);
    
    // fetch the image
    Image memory _image = images[_id];
    // fetch author
    address payable _author = _image.author;
    // tip the author
    address(_author).transfer(msg.value);
    // increment tip amount
    _image.tipAmount = _image.tipAmount + msg.value;
    // update image
    images[_id] = _image;

    //fire event
    emit ImageTipped(_id, _image.hash, _image.description, _image.tipAmount, _author);
  }
}