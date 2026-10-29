import { supabase, isSupabaseConfigured } from './auth';

const LOCAL_LADDER_KEY = 'career_ladder_user_ladder';
const LOCAL_TASKS_KEY = 'career_ladder_user_tasks';

// Initial seed opportunities for MyLadder
export const INITIAL_LADDER_ITEMS = [
  {
    id: 'ladder-item-1',
    status: 'saved',
    notes: 'Premier collegiate hackathon. Want to demo an agentic workflow project.',
    opportunity_id: 'opp-hackmit-2026',
    opportunities: {
      id: 'opp-hackmit-2026',
      title: 'HackMIT 2026',
      organization: 'MIT',
      category: 'Hackathon',
      opportunity_link: 'https://hackmit.org',
      deadline: 'Oct 15'
    },
    created_at: new Date(Date.now() - 2 * 86400000).toISOString()
  },
  {
    id: 'ladder-item-2',
    status: 'applied',
    notes: 'Submitted resume and referral link. Completed technical screening questionnaire.',
    opportunity_id: 'opp-google-swe-intern',
    opportunities: {
      id: 'opp-google-swe-intern',
      title: 'Software Engineering Intern (Summer 2026)',
      organization: 'Google',
      category: 'Internship',
      opportunity_link: 'https://careers.google.com',
      deadline: 'Rolling admissions'
    },
    created_at: new Date(Date.now() - 5 * 86400000).toISOString()
  },
  {
    id: 'ladder-item-3',
    status: 'interviewing',
    notes: 'Round 2 technical architecture interview scheduled for Thursday.',
    opportunity_id: 'opp-frontier-ai-eng',
    opportunities: {
      id: 'opp-frontier-ai-eng',
      title: 'Full Stack AI Engineer',
      organization: 'Frontier AI Labs',
      category: 'Job',
      opportunity_link: 'https://careerladder.dev',
      deadline: 'Immediate'
    },
    created_at: new Date(Date.now() - 9 * 86400000).toISOString()
  },
  {
    id: 'ladder-item-4',
    status: 'saved',
    notes: 'NSF grant on multimodal generative models and agent memory systems.',
    opportunity_id: 'opp-nsf-fellow',
    opportunities: {
      id: 'opp-nsf-fellow',
      title: 'Generative AI Research Fellow',
      organization: 'NSF REU Site',
      category: 'Research',
      opportunity_link: 'https://nsf.gov',
      deadline: 'Nov 30'
    },
    created_at: new Date(Date.now() - 1 * 86400000).toISOString()
  }
];

// Initial seed tasks for Career Progression Board
export const INITIAL_CAREER_TASKS = [
  {
    id: 'task-1',
    title: 'HackMIT 2026 Participation',
    status: 'IN_PROGRESS',
    completion_percentage: 66,
    category: 'Hackathon',
    created_at: new Date(Date.now() - 4 * 86400000).toISOString(),
    task_checklists: [
      { id: 'chk-1', item_description: 'Register team on Devpost and finalize roster', is_checked: true },
      { id: 'chk-2', item_description: 'Set up GitHub repository & CI/CD workflow', is_checked: true },
      { id: 'chk-3', item_description: 'Implement real-time multimodal agent demo', is_checked: false }
    ]
  },
  {
    id: 'task-2',
    title: 'Won: CalHacks 11.0 Best Generative AI App',
    status: 'OUTCOME_COMPLETE',
    completion_percentage: 100,
    category: 'Hackathon',
    created_at: new Date(Date.now() - 12 * 86400000).toISOString(),
    task_checklists: [
      { id: 'chk-4', item_description: 'Pitch to venture sponsors and judges', is_checked: true },
      { id: 'chk-5', item_description: 'Published open source SDK on PyPI', is_checked: true },
      { id: 'chk-6', item_description: 'Collected $5,000 grand prize grant', is_checked: true }
    ]
  },
  {
    id: 'task-3',
    title: 'Learnings from: Jane Street Quantitative Fellowship',
    status: 'OUTCOME_FAILED',
    completion_percentage: 100,
    category: 'Internship',
    created_at: new Date(Date.now() - 18 * 86400000).toISOString(),
    task_checklists: [
      { id: 'chk-7', item_description: 'Completed round 1 probability and mental math screen', is_checked: true },
      { id: 'chk-8', item_description: 'Post-interview retrospective on stochastic calculus', is_checked: true }
    ]
  }
];

function getStoredJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(fallback));
      return fallback;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.warn(`Error reading ${key}:`, e);
    return fallback;
  }
}

function setStoredJson(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(`Error saving ${key}:`, e);
  }
}

/**
 * Fetch all ladder items for a user.
 */
export async function getLadderItems(userId) {
  if (isSupabaseConfigured && userId && !userId.startsWith('local-') && !userId.startsWith('demo-')) {
    try {
      const { data, error } = await supabase
        .from('user_ladder')
        .select(`
          id,
          status,
          notes,
          opportunity_id,
          created_at,
          opportunities (
            id,
            title,
            organization,
            category,
            opportunity_link,
            deadline
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        return data;
      }
    } catch (err) {
      console.warn('Supabase getLadderItems fallback:', err.message);
    }
  }

  return getStoredJson(LOCAL_LADDER_KEY, INITIAL_LADDER_ITEMS);
}

/**
 * Save an opportunity to MyLadder.
 */
export async function saveOpportunityToLadder(opportunity, userId) {
  if (!opportunity) return null;

  const newItem = {
    id: 'ladder-' + Date.now(),
    status: 'saved',
    notes: 'Saved from Personalized Feed.',
    opportunity_id: opportunity.id,
    created_at: new Date().toISOString(),
    opportunities: {
      id: opportunity.id,
      title: opportunity.title,
      organization: opportunity.organization,
      category: opportunity.category || 'General',
      opportunity_link: opportunity.opportunity_link || '#',
      deadline: opportunity.deadline || 'Remote'
    }
  };

  if (isSupabaseConfigured && userId && !userId.startsWith('local-') && !userId.startsWith('demo-')) {
    try {
      const { error } = await supabase
        .from('user_ladder')
        .insert({
          user_id: userId,
          opportunity_id: opportunity.id,
          status: 'saved'
        });
      if (error && error.code !== '23505') {
        console.warn('Supabase save error:', error.message);
      }
    } catch (e) {
      console.warn('Supabase save failed:', e);
    }
  }

  // Update local store
  const current = getStoredJson(LOCAL_LADDER_KEY, INITIAL_LADDER_ITEMS);
  const exists = current.some(
    item => item.opportunity_id === opportunity.id || item.opportunities?.title === opportunity.title
  );

  if (!exists) {
    const updated = [newItem, ...current];
    setStoredJson(LOCAL_LADDER_KEY, updated);
    window.dispatchEvent(new CustomEvent('ladder-updated', { detail: updated }));
    return newItem;
  }

  return null;
}

/**
 * Update the status of a ladder item (saved, applied, interviewing).
 */
export async function updateLadderItemStatus(itemId, newStatus) {
  const current = getStoredJson(LOCAL_LADDER_KEY, INITIAL_LADDER_ITEMS);
  const updated = current.map(item =>
    item.id === itemId ? { ...item, status: newStatus, updated_at: new Date().toISOString() } : item
  );
  setStoredJson(LOCAL_LADDER_KEY, updated);

  if (isSupabaseConfigured) {
    try {
      await supabase
        .from('user_ladder')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', itemId);
    } catch (e) {
      // Ignored in local mode
    }
  }

  window.dispatchEvent(new CustomEvent('ladder-updated', { detail: updated }));
  return updated;
}

/**
 * Delete a ladder item.
 */
export async function deleteLadderItem(itemId) {
  const current = getStoredJson(LOCAL_LADDER_KEY, INITIAL_LADDER_ITEMS);
  const updated = current.filter(item => item.id !== itemId);
  setStoredJson(LOCAL_LADDER_KEY, updated);

  if (isSupabaseConfigured) {
    try {
      await supabase.from('user_ladder').delete().eq('id', itemId);
    } catch (e) {
      // Ignored
    }
  }

  window.dispatchEvent(new CustomEvent('ladder-updated', { detail: updated }));
  return updated;
}

/**
 * Move a ladder opportunity to Career Progression Tasks.
 * Outcome can be 'Win', 'Lose', or 'Participation'.
 */
export async function moveLadderToTasks(item, outcome, userId) {
  const opp = item.opportunities || {};
  let taskStatus = 'OUTCOME_COMPLETE';
  let prefix = 'Won: ';
  let completion = 100;

  if (outcome === 'Lose') {
    taskStatus = 'OUTCOME_FAILED';
    prefix = 'Learnings from: ';
  } else if (outcome === 'Participation') {
    taskStatus = 'IN_PROGRESS';
    prefix = 'Participating in: ';
    completion = 50;
  }

  const category = opp.category || 'General';

  // Generate contextual checklists
  let checklists = [];
  if (category === 'Hackathon') {
    checklists = [
      { id: 'chk-' + Date.now() + '-1', item_description: 'Register team & submit project pitch', is_checked: true },
      { id: 'chk-' + Date.now() + '-2', item_description: 'Build core MVP & GitHub repository', is_checked: outcome !== 'Participation' },
      { id: 'chk-' + Date.now() + '-3', item_description: 'Deliver demo pitch to judging committee', is_checked: outcome === 'Win' }
    ];
  } else if (category === 'Research') {
    checklists = [
      { id: 'chk-' + Date.now() + '-1', item_description: 'Submit proposal & literature review', is_checked: true },
      { id: 'chk-' + Date.now() + '-2', item_description: 'Run experiments & benchmark latency', is_checked: outcome !== 'Participation' },
      { id: 'chk-' + Date.now() + '-3', item_description: 'Draft paper manuscript & conference preprint', is_checked: outcome === 'Win' }
    ];
  } else {
    checklists = [
      { id: 'chk-' + Date.now() + '-1', item_description: 'Resume screen & recruiter call', is_checked: true },
      { id: 'chk-' + Date.now() + '-2', item_description: 'Technical coding & system design round', is_checked: outcome !== 'Participation' },
      { id: 'chk-' + Date.now() + '-3', item_description: 'Final executive interview & offer negotiation', is_checked: outcome === 'Win' }
    ];
  }

  const newTask = {
    id: 'task-' + Date.now(),
    title: `${prefix}${opp.title || 'Career Opportunity'}`,
    status: taskStatus,
    category: category,
    completion_percentage: completion,
    created_at: new Date().toISOString(),
    task_checklists: checklists
  };

  // Add to Career Tasks
  const currentTasks = getStoredJson(LOCAL_TASKS_KEY, INITIAL_CAREER_TASKS);
  const updatedTasks = [newTask, ...currentTasks];
  setStoredJson(LOCAL_TASKS_KEY, updatedTasks);

  // Remove from Ladder
  await deleteLadderItem(item.id);

  if (isSupabaseConfigured && userId && !userId.startsWith('local-') && !userId.startsWith('demo-')) {
    try {
      await supabase.from('career_tasks').insert({
        user_id: userId,
        title: newTask.title,
        linked_id: opp.id,
        status: taskStatus,
        completion_percentage: completion
      });
    } catch (e) {
      console.warn('Supabase task insert fallback:', e);
    }
  }

  window.dispatchEvent(new CustomEvent('tasks-updated', { detail: updatedTasks }));
  return { updatedTasks, newTask };
}

/**
 * Fetch all Career Progression Tasks.
 */
export async function getCareerTasks(userId) {
  if (isSupabaseConfigured && userId && !userId.startsWith('local-') && !userId.startsWith('demo-')) {
    try {
      const { data, error } = await supabase
        .from('career_tasks')
        .select(`
          *,
          task_checklists(*)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        return data;
      }
    } catch (err) {
      console.warn('Supabase getCareerTasks fallback:', err.message);
    }
  }

  return getStoredJson(LOCAL_TASKS_KEY, INITIAL_CAREER_TASKS);
}

/**
 * Update Career Task status (IN_PROGRESS, OUTCOME_COMPLETE, OUTCOME_FAILED).
 */
export async function updateCareerTaskStatus(taskId, newStatus) {
  const current = getStoredJson(LOCAL_TASKS_KEY, INITIAL_CAREER_TASKS);
  const updated = current.map(t => {
    if (t.id === taskId) {
      const isDone = newStatus === 'OUTCOME_COMPLETE' || newStatus === 'OUTCOME_FAILED';
      return {
        ...t,
        status: newStatus,
        completion_percentage: isDone ? 100 : t.completion_percentage,
        updated_at: new Date().toISOString()
      };
    }
    return t;
  });

  setStoredJson(LOCAL_TASKS_KEY, updated);

  if (isSupabaseConfigured) {
    try {
      await supabase
        .from('career_tasks')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', taskId);
    } catch (e) {
      // Ignored
    }
  }

  window.dispatchEvent(new CustomEvent('tasks-updated', { detail: updated }));
  return updated;
}

/**
 * Toggle a checklist checkbox on a Career Task.
 */
export function toggleTaskChecklist(taskId, checklistId) {
  const current = getStoredJson(LOCAL_TASKS_KEY, INITIAL_CAREER_TASKS);
  const updated = current.map(task => {
    if (task.id === taskId) {
      const checklists = (task.task_checklists || []).map(chk =>
        chk.id === checklistId ? { ...chk, is_checked: !chk.is_checked } : chk
      );
      const total = checklists.length;
      const done = checklists.filter(c => c.is_checked).length;
      const completion = total > 0 ? Math.round((done / total) * 100) : task.completion_percentage;
      const autoStatus = (done === total && total > 0) ? 'OUTCOME_COMPLETE' : task.status;

      return {
        ...task,
        status: autoStatus,
        completion_percentage: completion,
        task_checklists: checklists
      };
    }
    return task;
  });

  setStoredJson(LOCAL_TASKS_KEY, updated);
  window.dispatchEvent(new CustomEvent('tasks-updated', { detail: updated }));
  return updated;
}

/**
 * Add a new custom career milestone task.
 */
export function addCareerTask({ title, category = 'Custom', checklists = [] }) {
  const current = getStoredJson(LOCAL_TASKS_KEY, INITIAL_CAREER_TASKS);
  const formattedChecklists = checklists.map((item, idx) => ({
    id: `chk-${Date.now()}-${idx}`,
    item_description: item,
    is_checked: false
  }));

  const newTask = {
    id: 'task-' + Date.now(),
    title: title || 'Custom Career Goal',
    category,
    status: 'IN_PROGRESS',
    completion_percentage: 0,
    created_at: new Date().toISOString(),
    task_checklists: formattedChecklists.length > 0 ? formattedChecklists : [
      { id: 'chk-custom-1', item_description: 'Draft action plan and requirements', is_checked: false },
      { id: 'chk-custom-2', item_description: 'Execute deliverables and review results', is_checked: false }
    ]
  };

  const updated = [newTask, ...current];
  setStoredJson(LOCAL_TASKS_KEY, updated);
  window.dispatchEvent(new CustomEvent('tasks-updated', { detail: updated }));
  return updated;
}

/**
 * Delete a Career Task.
 */
export function deleteCareerTask(taskId) {
  const current = getStoredJson(LOCAL_TASKS_KEY, INITIAL_CAREER_TASKS);
  const updated = current.filter(t => t.id !== taskId);
  setStoredJson(LOCAL_TASKS_KEY, updated);
  window.dispatchEvent(new CustomEvent('tasks-updated', { detail: updated }));
  return updated;
}

/**
 * Computes consolidated career level, total XP, and earned skills from both Ladder and Tasks.
 */
export function computeCareerStats(ladderItems = [], careerTasks = []) {
  // Ladder XP weights: saved: 15 XP, applied: 40 XP, interviewing: 80 XP, completed: 150 XP
  const ladderXp = ladderItems.reduce((acc, item) => {
    if (item.status === 'saved') return acc + 15;
    if (item.status === 'applied') return acc + 40;
    if (item.status === 'interviewing') return acc + 80;
    if (item.status === 'completed') return acc + 150;
    return acc + 10;
  }, 0);

  // Career Task XP: in progress: 50 XP, completed win: 150 XP, completed learning: 75 XP
  const taskXp = careerTasks.reduce((acc, task) => {
    if (task.status === 'OUTCOME_COMPLETE') return acc + 150;
    if (task.status === 'OUTCOME_FAILED') return acc + 75;
    if (task.status === 'IN_PROGRESS') return acc + 50;
    return acc + 25;
  }, 0);

  const totalXp = ladderXp + taskXp;

  // Level Progression: Level 1 (0-150), Level 2 (151-400), Level 3 (401-750), Level 4 (751-1200), Level 5 (1200+)
  let level = 1;
  let levelCap = 250;
  if (totalXp >= 1200) {
    level = 5;
    levelCap = 2000;
  } else if (totalXp >= 750) {
    level = 4;
    levelCap = 1200;
  } else if (totalXp >= 400) {
    level = 3;
    levelCap = 750;
  } else if (totalXp >= 150) {
    level = 2;
    levelCap = 400;
  }

  const progressPercent = Math.min(100, Math.round((totalXp / levelCap) * 100));

  // Extract skills from opportunities and wins
  const skillSet = new Set();
  ladderItems.forEach(item => {
    if (item.opportunities?.category) skillSet.add(item.opportunities.category);
  });
  careerTasks.forEach(task => {
    if (task.category) skillSet.add(task.category);
    if (task.status === 'OUTCOME_COMPLETE') skillSet.add('Rapid Prototyping');
  });

  const skills = Array.from(skillSet).filter(Boolean);
  if (skills.length === 0) skills.push('Full-Stack Engineering', 'AI Systems');

  // Next upcoming deadline
  const pending = ladderItems.filter(
    i => i.opportunities?.deadline && i.opportunities.deadline !== 'Remote' && i.opportunities.deadline !== 'Immediate'
  );
  const nextDeadline = pending.length > 0 ? pending[0].opportunities.deadline : 'All upcoming on schedule';

  return {
    totalXp,
    level,
    levelCap,
    progressPercent,
    skills: skills.slice(0, 4),
    nextDeadline,
    ladderCount: ladderItems.length,
    winsCount: careerTasks.filter(t => t.status === 'OUTCOME_COMPLETE').length
  };
}

