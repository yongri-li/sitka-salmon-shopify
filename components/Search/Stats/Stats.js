import classes from "./Stats.module.scss"

import { useConnector } from 'react-instantsearch-hooks-web';
import connectStats from 'instantsearch.js/es/connectors/stats/connectStats';

export function useStats(props) {
  return useConnector(connectStats, props);
}

const Stats = (props) => {
  const {
    nbHits,
    query,
  } = useStats(props)

  return (
    <p className="secondary--body">Show {nbHits} results for "{query}"</p>
  )
}

export default Stats