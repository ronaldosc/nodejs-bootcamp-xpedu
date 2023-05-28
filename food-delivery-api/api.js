const express = require('express');
const fs = require('node:fs');

const app = express()
app.use(express.json());
app.use(express.urlencoded({ extended: true }))

const pedidosFilePath = './pedidos.json';

function lerPedidos() {
    const data = fs.readFileSync(pedidosFilePath, { encoding: 'utf-8' });
    return JSON.parse(data);
}

function salvarPedidos(pedidos) {
    fs.writeFileSync(pedidosFilePath, JSON.stringify(pedidos, null, 2));
}

function getNextId() {
    const pedidos = lerPedidos();
    const nextId = pedidos.nextId;
    pedidos.nextId = nextId + 1;
    salvarPedidos(pedidos);
    return nextId;
}

app.get('/pedidos', (_, res) => {
    const pedidos = lerPedidos();
    res.json(pedidos.pedidos);
});

app.get('/pedidos/:id', ({ params: { id } }, res) => {
    const pedidos = lerPedidos();
    const pedido = pedidos.pedidos.find(pedido => pedido.id === Number(id));
    if (!pedido) {
        return res.status(404).json({ error: 'Pedido não encontrado' });
    }
    res.json(pedido);
});

app.post('/pedidos', ({ body: { cliente, produto, valor } }, res) => {
    const pedido = {
        id: getNextId(),
        cliente,
        produto,
        valor,
        entregue: false,
        timestamp: new Date().toISOString(),
    };
    const pedidos = lerPedidos();
    pedidos.pedidos.push(pedido);
    salvarPedidos(pedidos);
    res.status(201).json(pedido);
});

app.put('/pedidos/:id', ({ body: { cliente, produto, valor, entregue }, params: { id } }, res) => {
    const pedidos = lerPedidos();
    const pedido = pedidos.pedidos.find(pedido => pedido.id === Number(id));
    if (!pedido) {
        return res.status(404).json({ error: 'Pedido não encontrado' });
    }
    pedido.cliente = cliente || pedido.cliente;
    pedido.produto = produto || pedido.produto;
    pedido.valor = valor || pedido.valor;
    pedido.entregue = entregue === undefined ? pedido.entregue : entregue;
    salvarPedidos(pedidos);
    res.json(pedido);
});

app.patch('/pedidos/:id', ({ body: { entregue }, params: { id } }, res) => {
    const pedidos = lerPedidos();
    const pedido = pedidos.pedidos.find(pedido => pedido.id === Number(id));
    if (!pedido) {
        return res.status(404).json({ error: 'Pedido não encontrado' });
    }
    pedido.entregue = entregue;
    salvarPedidos(pedidos);
    res.json(pedido);
});

app.delete('/pedidos/:id', ({ params: { id } }, res) => {
    const pedidos = lerPedidos();
    const index = pedidos.pedidos.findIndex(pedido => pedido.id === Number(id));
    if (index === -1) {
        return res.status(404).json({ error: 'Pedido não encontrado' });
    }
    const pedido = pedidos.pedidos.splice(index, 1)[0];
    salvarPedidos(pedidos);
    res.json(pedido);
});

app.get('/clientes/:cliente/valor-total', ({ params: { cliente } }, res) => {
    const pedidos = lerPedidos();
    const total = pedidos.pedidos
        .filter(pedido => pedido.cliente === cliente && pedido.entregue)
        .reduce((acc, pedido) => acc + pedido.valor, 0);
    res.json({ total });
});

app.get('/produtos/:produto/valor-total', ({ params: { produto } }, res) => {
    const pedidos = lerPedidos();
    const total = pedidos.pedidos
        .filter(pedido => pedido.produto === produto && pedido.entregue)
        .reduce((acc, pedido) => acc + pedido.valor, 0);
    res.json({ total });
});

app.get('/produtos/mais-vendidos', (_, res) => {
    const pedidos = lerPedidos();
    const produtos = {};
    pedidos.pedidos
        .filter(pedido => pedido.entregue)
        .forEach(pedido => {
            if (!produtos[pedido.produto]) {
                produtos[pedido.produto] = 0;
            }
            produtos[pedido.produto]++;
        });
    const maisVendidos = Object.entries(produtos)
        .sort((a, b) => b[1] - a[1])
        .map(([produto, quantidade]) => `${produto} - ${quantidade}`);
    res.json(maisVendidos);
});

app.listen(3000, () => {
    console.log('Servidor iniciado na porta 3000');
});
