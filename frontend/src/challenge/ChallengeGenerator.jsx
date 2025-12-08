import "react"
import {useState, useEffect} from "react"
import {useApi} from "../utils/api.js"


export function ChallengeGenerator() {
    const [nodesData, setNodesData] = useState(null)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState(null)
    const [topic, setTopic] = useState("")
    const [maxSubtopics, setMaxSubtopics] = useState(6)
    const [quota, setQuota] = useState(null)
    const {makeRequest} = useApi()

    useEffect(() => {
        fetchQuota()
    }, [])

    const fetchQuota = async () => {
        try {
            const data = await makeRequest("quota")
            console.log("#############Quota data###################:", data);
            setQuota(data)
        } catch (err) {
            console.log(err)
        }
    }

    const generateTopicNodes = async () => {
        if (!topic) return setError("Please enter a topic")
        setIsLoading(true)
        setError(null)

        try {
            const data = await makeRequest("generate-challenge", {
                method: "POST",
                body: JSON.stringify({ topic, max_subtopics: maxSubtopics })
            })
            setNodesData(data)
            fetchQuota()
        } catch (err) {
            setError(err.message || "Failed to generate topic nodes.")
        } finally {
            setIsLoading(false)
        }
    }

    
    const getNextResetTime = () => {
        if (!quota?.last_reset_date) return null
        const resetDate = new Date(quota.last_reset_date)
        resetDate.setHours(resetDate.getHours() + 24)
        return resetDate
    }

    return <div className="challenge-container">
        <h2>Coding Challenge Generator</h2>

        <div className="quota-display">
            {/* <p>Challenges remaining today: {quota?.quota_remaining || 0}</p> */}
            <p>Challenges remaining today: {quota?.quota_remaining ?? 0}</p>
            {quota?.quota_remaining === 0 && (
                <p>Next reset: {getNextResetTime()?.toLocaleString()}</p>
            )}
        </div>
        <div className="topic-input flex items-center gap-2">
            <input
                className="px-3 py-2 border rounded w-64"
                placeholder="Enter topic (e.g., ReactJS)"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                disabled={isLoading}
            />
            <input
                type="number"
                min={1}
                max={12}
                value={maxSubtopics}
                onChange={(e) => setMaxSubtopics(Number(e.target.value))}
                className="w-20 px-2 py-1 border rounded"
            />
            <button
                onClick={generateTopicNodes}
                disabled={isLoading || quota?.quota_remaining === 0}
                className="generate-button px-4 py-2 bg-blue-600 text-white rounded"
            >
                {isLoading ? "Generating..." : "Generate Nodes"}
            </button>
        </div>

        {error && <div className="error-message">
            <p>{error}</p>
        </div>}


        {nodesData && (
            <div className="nodes-grid mt-4">
                <h3 className="text-lg font-semibold">{nodesData.topic}</h3>
                <div className="flex gap-4 mt-3 flex-wrap">
                    {nodesData.nodes.map((node) => (
                        <div key={node.id} className="node-card bg-white p-3 rounded shadow-md w-48">
                            <div className="node-center cursor-pointer" onClick={async () => {
                                try {
                                    const detail = await makeRequest("generate-node-detail", {
                                        method: "POST",
                                        body: JSON.stringify({ topic: nodesData.topic, node_title: node.title })
                                    })
                                    alert(JSON.stringify(detail, null, 2))
                                } catch (err) {
                                    alert(err.message || "Failed to fetch node detail")
                                }
                            }}>
                                <p className="font-medium">{node.title}</p>
                            </div>
                            {node.children && node.children.length > 0 && (
                                <p className="text-sm text-gray-500 mt-2">Children: {node.children.join(", ")}</p>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        )}

    </div>
}