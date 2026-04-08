import React, { useState } from 'react';
import { generateQuestion, evaluateAnswer } from '../lib/api';
import { Swords, Lightbulb, Send, CheckCircle, XCircle } from 'lucide-react';

const TOPICS = ['arrays', 'strings', 'linked_list', 'trees', 'graphs', 'dp', 'binary_search',
  'sliding_window', 'stack', 'queue', 'heap', 'backtracking', 'greedy', 'trie', 'hashing'];

export default function MockInterviewPage() {
  const userId = localStorage.getItem('userId');
  const [config, setConfig] = useState({
    session_type: 'dsa', company: 'Amazon', difficulty: 'medium', topic: 'arrays',
  });
  const [session, setSession] = useState(null);
  const [answer, setAnswer] = useState('');
  const [code, setCode] = useState('');
  const [evaluation, setEvaluation] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [evaluating, setEvaluating] = useState(false);
  const [showHints, setShowHints] = useState(false);

  const handleGenerate = async () => {
    setGenerating(true);
    setSession(null);
    setEvaluation(null);
    setAnswer('');
    setCode('');
    setShowHints(false);
    try {
      const { data } = await generateQuestion(userId, config);
      setSession(data);
    } catch (err) {
      alert('Failed: ' + (err.response?.data?.error || err.message));
    }
    setGenerating(false);
  };

  const handleEvaluate = async () => {
    if (!answer.trim() && !code.trim()) return;
    setEvaluating(true);
    try {
      const { data } = await evaluateAnswer(session.session_id, { answer_text: answer, code });
      setEvaluation(data);
    } catch (err) {
      alert('Evaluation failed: ' + (err.response?.data?.error || err.message));
    }
    setEvaluating(false);
  };

  if (!userId) return <div className="empty-state"><h3>Upload your resume first</h3></div>;

  const q = session?.question;

  return (
    <div>
      <div className="page-header">
        <div className="page-title"><Swords size={24} /> Mock Interview</div>
        <div className="page-subtitle">Practice with AI-generated questions and get instant feedback</div>
      </div>

      {/* Config */}
      <div className="card">
        <div className="card-title" style={{ marginBottom: 16 }}>Configure Session</div>
        <div className="grid-4">
          <div className="form-group">
            <label className="form-label">Type</label>
            <select className="select" value={config.session_type}
              onChange={e => setConfig({ ...config, session_type: e.target.value })}>
              <option value="dsa">DSA</option>
              <option value="lld">Low Level Design</option>
              <option value="hld">High Level Design</option>
              <option value="behavioral">Behavioral</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Company Style</label>
            <input className="input" value={config.company}
              onChange={e => setConfig({ ...config, company: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">Difficulty</label>
            <select className="select" value={config.difficulty}
              onChange={e => setConfig({ ...config, difficulty: e.target.value })}>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Topic</label>
            <select className="select" value={config.topic}
              onChange={e => setConfig({ ...config, topic: e.target.value })}>
              {TOPICS.map(t => <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>)}
            </select>
          </div>
        </div>
        <button className="btn btn-primary" onClick={handleGenerate} disabled={generating}>
          {generating ? 'Generating...' : 'Generate Question'}
        </button>
      </div>

      {/* Question */}
      {q && (
        <div className="card">
          <div className="card-header">
            <span className="card-title">{q.question_title}</span>
            <div className="tag-list">
              {(q.tags || []).map(t => <span key={t} className="tag">{t}</span>)}
            </div>
          </div>

          <div style={{ fontSize: 14, lineHeight: 1.8, marginBottom: 16, whiteSpace: 'pre-wrap' }}>
            {q.question_text}
          </div>

          {/* Examples */}
          {q.examples?.map((ex, i) => (
            <div key={i} className="code-block" style={{ marginBottom: 8 }}>
              <div><strong>Input:</strong> {ex.input}</div>
              <div><strong>Output:</strong> {ex.output}</div>
              {ex.explanation && <div style={{ color: 'var(--text-muted)' }}><strong>Explanation:</strong> {ex.explanation}</div>}
            </div>
          ))}

          {/* Constraints */}
          {q.constraints?.length > 0 && (
            <div style={{ marginTop: 12 }}>
              <div className="form-label">Constraints</div>
              <ul style={{ paddingLeft: 20, fontSize: 13, color: 'var(--text-muted)' }}>
                {q.constraints.map((c, i) => <li key={i}>{c}</li>)}
              </ul>
            </div>
          )}

          {/* Hints */}
          <div style={{ marginTop: 16 }}>
            <button className="btn btn-secondary" onClick={() => setShowHints(!showHints)}>
              <Lightbulb size={14} /> {showHints ? 'Hide Hints' : 'Show Hints'}
            </button>
            {showHints && q.hints && (
              <ol style={{ paddingLeft: 20, marginTop: 8, fontSize: 14 }}>
                {q.hints.map((h, i) => <li key={i} style={{ marginBottom: 4 }}>{h}</li>)}
              </ol>
            )}
          </div>

          {/* Expected complexity */}
          <div style={{ marginTop: 12, fontSize: 13, color: 'var(--text-muted)' }}>
            Expected: Time {q.optimal_time_complexity} · Space {q.optimal_space_complexity}
          </div>
        </div>
      )}

      {/* Answer Submission */}
      {q && !evaluation && (
        <div className="card">
          <div className="card-title" style={{ marginBottom: 16 }}>Your Answer</div>
          <div className="form-group">
            <label className="form-label">Approach / Explanation</label>
            <textarea className="textarea" rows={4} placeholder="Explain your approach..."
              value={answer} onChange={e => setAnswer(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Code</label>
            <textarea className="textarea code-block" rows={12}
              placeholder="Write your solution here..."
              value={code} onChange={e => setCode(e.target.value)}
              style={{ fontFamily: "'JetBrains Mono', 'Fira Code', monospace", fontSize: 13 }} />
          </div>
          <button className="btn btn-primary" onClick={handleEvaluate} disabled={evaluating}>
            <Send size={16} /> {evaluating ? 'Evaluating...' : 'Submit for Evaluation'}
          </button>
        </div>
      )}

      {/* Evaluation Results */}
      {evaluation && (
        <div className="card">
          <div className="card-header">
            <span className="card-title">Evaluation Results</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div className="score-circle" style={{
                borderColor: evaluation.overall_score >= 70 ? 'var(--green)' : evaluation.overall_score >= 50 ? 'var(--yellow)' : 'var(--red)',
                color: evaluation.overall_score >= 70 ? 'var(--green)' : evaluation.overall_score >= 50 ? 'var(--yellow)' : 'var(--red)',
              }}>
                {evaluation.overall_score}
              </div>
              {evaluation.would_pass
                ? <span className="badge badge-green"><CheckCircle size={12} /> Would Pass</span>
                : <span className="badge badge-red"><XCircle size={12} /> Needs Work</span>
              }
            </div>
          </div>

          <div className="grid-2" style={{ marginBottom: 16 }}>
            {['correctness', 'optimization', 'code_quality', 'communication', 'trade_off_analysis'].map(key => {
              const item = evaluation[key];
              if (!item) return null;
              return (
                <div key={key} style={{ padding: 12, background: 'var(--bg)', borderRadius: 'var(--radius)', marginBottom: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontWeight: 600, fontSize: 14, textTransform: 'capitalize' }}>
                      {key.replace(/_/g, ' ')}
                    </span>
                    <span style={{ fontWeight: 700, color: item.score >= 70 ? 'var(--green)' : item.score >= 50 ? 'var(--yellow)' : 'var(--red)' }}>
                      {item.score}/100
                    </span>
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{item.feedback}</div>
                  {item.better_approach && (
                    <div style={{ fontSize: 13, color: 'var(--blue)', marginTop: 4 }}>
                      💡 {item.better_approach}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {evaluation.key_improvements?.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <div className="form-label">Key Improvements</div>
              <ul style={{ paddingLeft: 20, fontSize: 14 }}>
                {evaluation.key_improvements.map((k, i) => <li key={i}>{k}</li>)}
              </ul>
            </div>
          )}

          {evaluation.model_answer_outline && (
            <div>
              <div className="form-label">Model Answer Outline</div>
              <div className="code-block">{evaluation.model_answer_outline}</div>
            </div>
          )}

          <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={handleGenerate}>
            Next Question →
          </button>
        </div>
      )}
    </div>
  );
}
