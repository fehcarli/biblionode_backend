const fs = require("fs");
const db = require('../models');
const Books = db.livros;
const Genres = db.generos;
const Images = db.images;
const Op = db.Sequelize.Op;

exports.findAll = async(req, res) => {
    const book = req.params.titulo;
    const condition = book ? { book: { [Op.iLike]: `%${titulo}%`}} : null;
    Books.findAndCountAll({
        where: condition,
        include: [{
            model: Genres,
            attributes: ['nomeGenero', 'corEtiqueta']
        }],
        limit: 10
    }).then(data => {
        res.status(200).send(data);
    }).catch(err => {
        res.status(500).send({
            message:
                err.message || "Algum erro ocorreu internamente."
        });
    });
}

exports.findById = async(req, res) => {
    const id = req.params.id;
    Books.findByPk(id, {
        include: [{
          model: Genres,
          through: { attributes: ['nomeGenero', 'corEtiqueta'] }
        }]
    }).then(data =>{
        if(data){
            res.status(200).send(data);
        } else {
            res.status(404).send({
                message: `Não é possível encontrar Livro de id=${id}.`
            });
        }
    }).catch(err => {
        res.status(500).send({
            message:
                err.message || "Erro ao buscar Livro de id=" + id
        });
    });
}

exports.createBook = async(req, res) => {
    const BOOK_MODEL = {
        titulo: req.body.titulo,
        autor: req.body.autor,
        codLivro: req.body.codLivro,
        isbn: req.body.isbn,
        numPaginas: req.body.numPaginas,
        editora: req.body.editora,
        edicao: req.body.edicao,
        ano: req.body.ano,
    };
    
    Books.create(BOOK_MODEL).then(data => {
        res.status(200).send(data);
    }).catch(err => {
        res.status(500).send({
            message:
                err.message || "Algum erro ocorreu ao cadastrar o Livro."
        });
    });
}

exports.updateById = async(req, res) => {
    const id = req.params.id;
    Books.update(req.body, {
        where: { id: id }
    }).then(() => {
        res.status(200).send({
            message: "Livro Atualizado com sucesso."
        });
    }).catch(err => {
        const id = req.params.id;
        res.status(500).send({
            message:
                err.message || "Erro ao atualizar o Livro de id= " + id
        });
    });
}

exports.uploadFiles = async (req, res) => {
    const id = req.params.id;
    const book = Books.findOne({
        where: id,
        include: [{
            model: Images,
            attributes: ['', '', '']
        }]
    })
    if(!book) {
        return res.status(400).send({ 
            error: 'Livro não encontrado' 
        });
    }
    try {
        if (req.file == undefined) {
            return res.send('Você precisa selecionar um arquivo');
        }
        Images.create({
            type: req.file.mimetype,
            name: req.file.originalname,
            data: fs.readFileSync(
            __basedir + "/resources/static/assets/uploads/" + req.file.filename
            ),
        }).then((image) => {
            fs.writeFileSync(
            __basedir + "/resources/static/assets/tmp/" + image.name,
            image.data
            );
            return res.send('Arquivo foi enviado');
        });
    } catch (error) {
      console.log(error);
      return res.send('Erro ao tentar enviar imagens: ${error}');
    }
};

exports.deleteById = (req, res) => {
    const id = req.params.id;
    Books.destroy({
        where: { id: id }
    })
    .then(num => {
        if (num == 1) {
            res.send({
            message: "Livro foi deletado com sucesso!"
            });
        } else {
            res.send({
            message: `Não possível deletar livro de id=${id}. Livro não encontrado!`
            });
        }
    })
    .catch(err => {
        res.status(500).send({
            message: "Você não pode deletar o Livro de id=" + id
        });
    });
}