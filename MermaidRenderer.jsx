import React, { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';

const MermaidRenderer = ({ code, type }) => {
  const diagramRef = useRef(null);
  const [svg, setSvg] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [renderKey, setRenderKey] = useState(0);

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: false,
      securityLevel: 'loose',
      theme: 'dark',
      themeVariables: {
        primaryColor: '#3b82f6',
        primaryBorderColor: '#1e40af',
        primaryTextColor: '#ffffff',
        lineColor: '#9ca3af',
        textColor: '#e5e7eb',
        fontSize: '16px',
        nodeBorder: '2px solid #3b82f6',
        clusterBorder: '2px dashed #9ca3af',
        clusterBkg: 'rgba(31, 41, 55, 0.3)',
      },
      flowchart: { useMaxWidth: false, htmlLabels: true },
      mindmap: { useMaxWidth: false, padding: 20 },
    });
  }, []);

  const cleanMindmapCode = (code) => {
    const lines = code
      .replace(/```mermaid/g, '')
      .replace(/```/g, '')
      .replace(/\\n/g, '\n')
      .split(/\n|\r/)
      .map(l => l.trim())
      .filter(Boolean);

    const result = ['mindmap'];
    let hasRoot = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (/^mindmap/.test(line)) continue;

      if (/^root\s*\(\(.*?\)\)/.test(line)) {
        result.push('  root((Main Topic))');
        hasRoot = true;
      } else {
        const sanitized = line
          .replace(/["'\[\]\(\){}]/g, '')
          .replace(/-->.*/g, '')
          .replace(/:/g, '')
          .trim();
        result.push(`    ${sanitized}`);
      }
    }

    if (!hasRoot) {
      result.splice(1, 0, '  root((Main Topic))');
    }

    return result.join('\n');
  };

  const cleanFlowchartCode = (code) => {
    return code
      .replace(/```mermaid/g, '')
      .replace(/```/g, '')
      .split('\n')
      .map(line => line.replace(/\bSubgraph\b/i, 'subgraph'))
      .join('\n');
  };

  const validateMermaidSyntax = (code) => {
    try {
      mermaid.parse(code);
    } catch (err) {
      console.error('Mermaid syntax validation failed:', err.message);
      throw err;
    }
  };

  useEffect(() => {
    if (!code) return;

    const renderDiagram = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const cleaned = type === 'mindmap' ? cleanMindmapCode(code) : cleanFlowchartCode(code);
        console.log('[Mermaid] Cleaned code to render:\n', cleaned);
        validateMermaidSyntax(cleaned);

        const containerId = `mermaid-${Date.now()}`;
        const container = document.createElement('div');
        container.id = containerId;
        container.style.display = 'none';
        document.body.appendChild(container);

        const { svg } = await mermaid.render(containerId, cleaned);
        setSvg(svg);

        if (document.body.contains(container)) {
          document.body.removeChild(container);
        }

        setRenderKey(k => k + 1);
      } catch (err) {
        console.error('Error rendering diagram:', err);
        setError(`Diagram Error: ${err.message.replace('Error: ', '')}`);
        if (type === 'mindmap') {
          setError(e => `${e}\n\nExample:\nmindmap\n  root((Main Topic))\n    Child 1\n    Child 2`);
        }
      } finally {
        setIsLoading(false);
      }
    };

    renderDiagram();
  }, [code, type]);

  if (error) {
    return <div className="text-red-400 p-4 whitespace-pre-wrap">{error}</div>;
  }

  if (isLoading) {
    return <div className="text-gray-400 p-4">Rendering diagram...</div>;
  }

  return (
    <div key={renderKey} className="relative w-full h-full">
      <div
        ref={diagramRef}
        className={`mermaid-diagram w-full min-h-[300px] flex items-center justify-center p-4`}
        dangerouslySetInnerHTML={{ __html: svg }}
      />
    </div>
  );
};

export default MermaidRenderer;
