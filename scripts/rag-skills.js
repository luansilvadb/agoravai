// rag-skills.mjs
import fs from 'fs';
import path from 'path';
import { pipeline, cos_sim } from '@xenova/transformers';

const SKILLS_DIR = '.windsurf/skills';
const OUTPUT_FILE = '.openspec-context.md';
const THRESHOLD = 0.3; // Quão rigorosa deve ser a similaridade (0 a 1)

async function runRAG() {
    const prompt = process.argv.slice(2).join(' ');
    
    if (!prompt) {
        console.error("❌ Erro: Forneça a intenção. Ex: node rag-skills.mjs 'criar tela de login'");
        process.exit(1);
    }

    console.log(`🧠 [Micro-RAG] Carregando modelo local e analisando intenção: "${prompt}"...`);
    
    // Carrega o modelo de embedding local (baixa apenas na 1ª vez, ~22MB)
    const extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2', {
        quantized: true, // Usa versão super leve
    });

    // Calcula o vetor da intenção do usuário
    const promptOutput = await extractor(prompt, { pooling: 'mean', normalize: true });
    const promptVector = promptOutput.data;

    // Lê todos os arquivos das skills
    const skillFiles = [];
    function scanDir(dir) {
        if (!fs.existsSync(dir)) return;
        const files = fs.readdirSync(dir);
        for (const file of files) {
            const fullPath = path.join(dir, file);
            if (fs.statSync(fullPath).isDirectory()) {
                scanDir(fullPath);
            } else if (fullPath.endsWith('.md')) {
                skillFiles.push(fullPath);
            }
        }
    }
    scanDir(SKILLS_DIR);

    if (skillFiles.length === 0) {
        console.log("⚠️ Nenhuma skill encontrada no diretório.");
        process.exit(0);
    }

    const results = [];

    // Vetoriza as skills e compara
    for (const filePath of skillFiles) {
        const content = fs.readFileSync(filePath, 'utf-8');
        // Pega só os primeiros 500 caracteres para a busca ser mais rápida e focada na intenção
        const snippet = content.substring(0, 500); 
        
        const fileOutput = await extractor(snippet, { pooling: 'mean', normalize: true });
        const fileVector = fileOutput.data;
        
        const similarity = cos_sim(promptVector, fileVector);
        
        if (similarity > THRESHOLD) {
            results.push({ filePath, similarity, content });
        }
    }

    // Ordena pelas mais relevantes
    results.sort((a, b) => b.similarity - a.similarity);
    const topResults = results.slice(0, 3); // Pega o Top 3

    if (topResults.length === 0) {
        console.log("ℹ️ Nenhuma skill específica detectada para esta tarefa.");
        fs.writeFileSync(OUTPUT_FILE, "Nenhuma skill específica necessária para esta tarefa.\n");
        process.exit(0);
    }

    // Monta o arquivo consolidado para o OpenSpec
    let finalContext = `# CONTEXTO DE SKILLS INJETADAS PELO RAG\n\n`;
    finalContext += `O RAG detectou que as seguintes diretrizes são vitais para a tarefa: "${prompt}"\n\n`;

    for (const res of topResults) {
        console.log(`✅ Skill conectada: ${res.filePath} (Score: ${res.similarity.toFixed(2)})`);
        finalContext += `## ORIGEM: ${res.filePath}\n${res.content}\n\n---\n\n`;
    }

    fs.writeFileSync(OUTPUT_FILE, finalContext);
    console.log(`🚀 [Micro-RAG] Arquivo ${OUTPUT_FILE} gerado com sucesso!`);
}

runRAG().catch(console.error);