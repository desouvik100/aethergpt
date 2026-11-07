import { Sparkles } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

function Message({role, content}) {
    return (
        <div className={`message-row-${role}`}>

            <div className="message-avatar">
                {role === "user" ? role.charAt(0).toUpperCase() : <Sparkles size={22}/>}
            </div>

            <div className="message-conetnt">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
            </div>

        </div>
    )
}

export default Message;