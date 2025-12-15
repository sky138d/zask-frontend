import React, { useState } from 'react';
import { X, Save, ChevronDown, Search } from 'lucide-react';

const cardTypes = ['골든글러브', '시그니처', '국가대표', '임팩트', '라이브 올스타', '라이브', '시즌'];
const upgradeOptions = Array.from({ length: 10 }, (_, i) => i + 1);
const trainingOptions = Array.from({ length: 25 }, (_, i) => i + 1);
const awakeningOptions = Array.from({ length: 9 }, (_, i) => i + 1);

const positions = ['SP1', 'SP2', 'SP3', 'SP4', 'SP5', 'CP', 'RP1', 'RP2', 'RP3', 'RP4', 'RP5', 'RP6', 'DH', 'C', '1B', '2B', '3B', 'SS', 'LF', 'CF', 'RF'];
const pitcherPositions = ['SP1', 'SP2', 'SP3', 'SP4', 'SP5', 'CP', 'RP1', 'RP2', 'RP3', 'RP4', 'RP5', 'RP6'];
const batterPositions = ['DH', 'C', '1B', '2B', '3B', 'SS', 'LF', 'CF', 'RF'];

export default function TeamModal({ isOpen, onClose, teamData, setTeamData, onSave, session, selectedTeamId, teams }) {
  const [expandedPosition, setExpandedPosition] = useState(null);

  if (!isOpen) return null;

  const handlePlayerChange = (position, field, value) => {
    setTeamData(prev => ({
      ...prev,
      players: {
        ...prev.players,
        [position]: {
          ...prev.players[position],
          [field]: value
        }
      }
    }));
  };

  const handleTeamScoreChange = (field, value) => {
    setTeamData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const currentTeam = teams.find(t => t.id === selectedTeamId);

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-y-auto p-6 shadow-2xl scrollbar-hide">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">{currentTeam?.name} - 팀 정보 관리</h2>
            <p className="text-sm text-gray-500 mt-1">👋 {session?.name} 구단주님, 모든 선수 정보를 입력해주세요.</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors shrink-0">
            <X size={24} className="text-gray-400" />
          </button>
        </div>

        <div className="space-y-6">
          {/* 팀 전체 스코어 */}
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100 rounded-xl p-4 space-y-4">
            <h3 className="font-bold text-gray-800 text-lg">팀 전체 스코어</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">세트덱 스코어</label>
                <input
                  type="number"
                  value={teamData.totalSetDeckScore || ''}
                  onChange={(e) => handleTeamScoreChange('totalSetDeckScore', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">전체 OVR</label>
                <input
                  type="number"
                  value={teamData.totalOvr || ''}
                  onChange={(e) => handleTeamScoreChange('totalOvr', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  placeholder="0"
                />
              </div>
            </div>
          </div>

          {/* 투수 라인업 */}
          <div className="space-y-3">
            <h3 className="font-bold text-gray-800 text-lg flex items-center gap-2">⚾ 투수 라인업</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* 좌측: 선발투수 SP1~5 */}
              <div className="space-y-3">
                {['SP1', 'SP2', 'SP3', 'SP4', 'SP5'].map(pos => (
                  <PlayerCard
                    key={pos}
                    position={pos}
                    player={teamData.players[pos] || {}}
                    onPlayerChange={handlePlayerChange}
                    isExpanded={expandedPosition === pos}
                    onToggle={() => setExpandedPosition(expandedPosition === pos ? null : pos)}
                  />
                ))}
              </div>
              {/* 우측: CP + 불펜투수 RP1~6 */}
              <div className="space-y-3">
                <PlayerCard
                  position="CP"
                  player={teamData.players['CP'] || {}}
                  onPlayerChange={handlePlayerChange}
                  isExpanded={expandedPosition === 'CP'}
                  onToggle={() => setExpandedPosition(expandedPosition === 'CP' ? null : 'CP')}
                />
                {['RP1', 'RP2', 'RP3', 'RP4', 'RP5', 'RP6'].map(pos => (
                  <PlayerCard
                    key={pos}
                    position={pos}
                    player={teamData.players[pos] || {}}
                    onPlayerChange={handlePlayerChange}
                    isExpanded={expandedPosition === pos}
                    onToggle={() => setExpandedPosition(expandedPosition === pos ? null : pos)}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* 타자 라인업 */}
          <div className="space-y-3">
            <h3 className="font-bold text-gray-800 text-lg flex items-center gap-2">🦁 타자 라인업</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {batterPositions.map(pos => (
                <PlayerCard
                  key={pos}
                  position={pos}
                  player={teamData.players[pos] || {}}
                  onPlayerChange={handlePlayerChange}
                  isExpanded={expandedPosition === pos}
                  onToggle={() => setExpandedPosition(expandedPosition === pos ? null : pos)}
                />
              ))}
            </div>
          </div>
        </div>

        {/* 저장 버튼 */}
        <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium transition-colors"
          >
            닫기
          </button>
          <button
            onClick={onSave}
            className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-bold shadow-sm transition-all flex items-center gap-2"
          >
            <Save size={18} /> 저장하기
          </button>
        </div>
      </div>
    </div>
  );
}

function PlayerCard({ position, player, onPlayerChange, isExpanded, onToggle }) {
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden bg-white hover:border-indigo-300 transition-colors">
      {/* 축약형 헤더 */}
      <button
        onClick={onToggle}
        className="w-full px-4 py-3 bg-gradient-to-r from-gray-50 to-gray-100 hover:from-indigo-50 hover:to-indigo-100 flex items-center justify-between transition-colors"
      >
        <div className="text-left">
          <p className="font-bold text-gray-800">{position}</p>
          <p className="text-sm text-gray-600">{player.name || '미입력'}</p>
        </div>
        <ChevronDown size={20} className={`text-gray-400 transition-transform shrink-0 ${isExpanded ? 'rotate-180' : ''}`} />
      </button>

      {/* 확장형 입력 폼 */}
      {isExpanded && (
        <div className="p-4 space-y-4 border-t border-gray-200 bg-white max-h-96 overflow-y-auto scrollbar-hide">
          {/* 선수명 + 카드종류 */}
          <div className="grid grid-cols-2 gap-3">
            <SearchableInput
              label="선수명"
              value={player.name || ''}
              onChange={(v) => onPlayerChange(position, 'name', v)}
              placeholder="선수명 검색"
              type="player"
            />
            <SelectField
              label="카드 종류"
              value={player.cardType || ''}
              onChange={(v) => onPlayerChange(position, 'cardType', v)}
              options={cardTypes}
            />
          </div>

          {/* 연도 + 강화단계 */}
          <div className="grid grid-cols-2 gap-3">
            <InputField
              label="연도"
              value={player.year || ''}
              onChange={(v) => onPlayerChange(position, 'year', v)}
              placeholder="예: 2024"
              disabled={player.cardType === '임팩트'}
            />
            <SelectField
              label="강화단계"
              value={player.upgradeLevel || ''}
              onChange={(v) => onPlayerChange(position, 'upgradeLevel', v)}
              options={upgradeOptions}
            />
          </div>

          {/* 훈련단계 + 각성단계 */}
          <div className="grid grid-cols-2 gap-3">
            <SelectField
              label="훈련단계"
              value={player.trainingLevel || ''}
              onChange={(v) => onPlayerChange(position, 'trainingLevel', v)}
              options={trainingOptions}
            />
            <SelectField
              label="각성단계"
              value={player.awakeningLevel || ''}
              onChange={(v) => onPlayerChange(position, 'awakeningLevel', v)}
              options={awakeningOptions}
            />
          </div>

          {/* 스킬 */}
          <div className="border-t pt-4">
            <p className="text-sm font-semibold text-gray-700 mb-3">스킬</p>
            <div className="space-y-3">
              <SkillField
                label="스킬 1"
                skillValue={player.skill1 || ''}
                onSkillChange={(v) => onPlayerChange(position, 'skill1', v)}
              />
              <SkillField
                label="스킬 2"
                skillValue={player.skill2 || ''}
                onSkillChange={(v) => onPlayerChange(position, 'skill2', v)}
              />
              <SkillField
                label="스킬 3"
                skillValue={player.skill3 || ''}
                onSkillChange={(v) => onPlayerChange(position, 'skill3', v)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function InputField({ label, value, onChange, placeholder, disabled = false }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className={`w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
          disabled ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''
        }`}
      />
    </div>
  );
}

function SelectField({ label, value, onChange, options }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
      >
        <option value="">선택</option>
        {options.map(opt => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    </div>
  );
}

function SearchableInput({ label, value, onChange, placeholder, type }) {
  // 추후 실제 검색 기능이 추가될 때 수정
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
      <div className="relative">
        <Search size={16} className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-7 pr-2 py-1.5 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
      </div>
    </div>
  );
}

function SkillField({ label, skillValue, onSkillChange }) {
  // 추후 스킬 데이터베이스 검색으로 변경될 부분
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
      <div className="relative">
        <Search size={16} className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={skillValue}
          onChange={(e) => onSkillChange(e.target.value)}
          placeholder="스킬 검색 (예: 파워, 정확도)"
          className="w-full pl-7 pr-2 py-1.5 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
      </div>
    </div>
  );
}
