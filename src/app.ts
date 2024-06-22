import express, { NextFunction, Request, Response } from "express";
import { Character } from "./character.js";

const app= express();
app.use(express.json()) //middleware que proporciona express para manejar los metodos post, put y patch

// metodos de http para comunicar el frontend con el backend:
// get --> obtener info sobre recursos
// post --> crear nuevos recursos
// delete --> borrar recursos
// put & patch --> modificar recursos

const characters = [
  new Character(
    'Darth Vader',
    'Sith',
    10,
    100,
    20,
    10,
    ['Ligthsaber', 'Death start'],
    'a02b91bc-3769-4221-beb1-d7a3aeba7dad'
  ),
]

// middleware
function santizeCharacterInput(req: Request, res:Response, next: NextFunction){
  req.body.sanitizedInput = {
    name: req.body.name, 
    characterClass: req.body.characterClass, 
    level: req.body.level,
    hp: req.body.hp, 
    mana:req.body.mana, 
    attack:req.body.attack, 
    items:req.body.items
  }
  // more checks here
  Object.keys(req.body.sanitizedInput).forEach((key) => {
    if (req.body.sanitizedInput[key] === undefined) {
      delete req.body.sanitizedInput[key]
    }
  })

  next()
}

app.get('/api/characters',(req,res)=>{
  res.json({data:characters});
})

app.get('/api/characters/:id',(req,res)=>{
  const character= characters.find((character)=> character.id === req.params.id);
  if(!character){
    return res.status(404).send({message: 'character not found!'});
  }
  return res.json({data:character});
})

// Metodo put usando Sanitizacion ---> funcion santizeCharacterInput
app.post('/api/characters', santizeCharacterInput, (req,res)=>{
  const {name, characterClass, level, hp, mana, attack, items} = req.body.sanitizedInput
  const character= new Character(name, characterClass, level, hp, mana, attack, items);
  characters.push(character);
  return res.status(201).send({message:'Character created', data:character})
})

// Metodo put usando Sanitizacion ---> funcion santizeCharacterInput
app.put('/api/characters/:id', santizeCharacterInput ,(req,res)=>{
  const characterIdx= characters.findIndex(character => character.id === req.params.id);
  if(characterIdx === -1 ){
   return res.status(404).send({message:'Character not found'})
  }

  characters[characterIdx]= {...characters[characterIdx], ...req.body.sanitizedInput};  
  return res.status(200).send({message:'Character update successfully', data:characters[characterIdx]});
})

// Metodo patch usando Sanitizacion ---> funcion santizeCharacterInput
app.patch('/api/characters/:id', santizeCharacterInput ,(req,res)=>{
  const characterIdx= characters.findIndex(character => character.id === req.params.id);
  if(characterIdx === -1 ){
   return res.status(404).send({message:'Character not found'})
  }

  characters[characterIdx]= {...characters[characterIdx], ...req.body.sanitizedInput};  
  return res.status(200).send({message:'Character update successfully', data:characters[characterIdx]});
})

app.delete('/api/characters/:id', (req,res)=>{
  const characterIdx= characters.findIndex(character => character.id === req.params.id);
  
  if(characterIdx === -1){
    res.status(404).send({message:'Character not found'})
  }else{
    characters.splice(characterIdx,1)
    res.status(200).send({message:'Character deleted successfuly'})
  };
})

app.use((_,res)=>{
  return res.status(404).send({message: 'Resource not found'})
})

app.listen(3000, ()=>{
  console.log('Server running on http://localhost: 3000/')
})

// Metodo post sin usar la funcion de sanitize...
// app.post('/api/characters',(req,res)=>{
//   const {name, characterClass, level, hp, mana, attack, items} = req.body
//   const character= new Character(name, characterClass, level, hp, mana, attack, items);
//   characters.push(character);
//   res.status(201).send({message:'Character created', data:character})
// })

// ------------------------------------------------------

// Metodo put sin usar la funcion de sanitize...
// app.put('/api/characters/:id', (req,res)=>{
//   const characterIdx= characters.findIndex(character => character.id === req.params.id);
//   if(characterIdx === -1 ){
//     res.status(404).send({message:'Character not found'})
//   }
//   const input=  {
//     name: req.body.name, 
//     characterClass: req.body.characterClass, 
//     level: req.body.level,
//     hp: req.body.hp, 
//     mana:req.body.mana, 
//     attack:req.body.attack, 
//     items:req.body.items
//   }
//   characters[characterIdx]= {...characters[characterIdx], ...input}; 
//   //  nota: {...characters[characterIdx], ...input} --> combina los 2 objetos. 
//   //  si hay propiedades duplicadas, toma los valores del objeto input de esta forma actualizando al characters[characterIdx]
 
//   res.status(200).send({message:'Character update successfully', data:characters[characterIdx]});
// })
