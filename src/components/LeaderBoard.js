import React from 'react';
import '../styles/LeaderBoard.css';
import RowRank from './Row';

const LeaderBoard = ({ users }) => (
  <div className="container leaderboard">
    <div className="leadheader">
      <h2>Leaderboard</h2>
    </div>
    <RowRank rank="#" name="Name" score="Score" />
    {users.map((item, index) => (
      <RowRank rank={index + 1} name={item.account} score={item.score} key={index} />
    ))}
  </div>
);

export default LeaderBoard;
