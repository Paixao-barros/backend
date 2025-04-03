const express = require('express');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000; // ✅ AGORA FUNCIONA NA RENDER

app.use(cors());

// CONFIGURAÇÃO DO MULTER PARA SALVAR OS PDFs NA PASTA uploads/
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + file.originalname;
    cb(null, uniqueName);
  }
});

const upload = multer({ storage });

// PERMITIR USO DE ARQUIVOS ESTÁTICOS
app.use(express.static(path.join(__dirname, 'public')));

// ENDPOINT DE UPLOAD
app.post('/upload', upload.single('arquivoContrato'), (req, res) => {
  const { fornecedor, dataInicio, dataValidade } = req.body;
  const arquivo = req.file;

  if (!arquivo) {
    return res.status(400).json({ erro: 'Arquivo não recebido' });
  }

  const novoContrato = {
    fornecedor,
    dataInicio,
    dataValidade,
    arquivo: arquivo.filename
  };

  const caminhoJSON = path.join(__dirname, 'dados', 'contratos.json');

  fs.readFile(caminhoJSON, 'utf8', (err, data) => {
    let contratos = [];

    if (!err && data) {
      try {
        contratos = JSON.parse(data);
      } catch (e) {
        console.error('Erro ao parsear JSON existente:', e);
      }
    }

    contratos.push(novoContrato);

    fs.writeFile(caminhoJSON, JSON.stringify(contratos, null, 2), err => {
      if (err) {
        return res.status(500).json({ erro: 'Erro ao salvar contrato' });
      }

      res.json({ mensagem: 'Contrato salvo com sucesso', dados: novoContrato });
    });
  });
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
