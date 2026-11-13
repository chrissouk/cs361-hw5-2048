# Codex implementation brief and prompt record

Agent: OpenAI Codex, substituted for Claude at the student's request.
These are the task prompts recorded and followed during this Codex run, rather than a transcript of a separate Claude session.
The student's actual messages were the homework assignment preceded by "this this for me CS361 Homework 5" and the follow-up "change claude for you". Codex expanded that request into the following implementation briefs. The student did not type these four briefs as separate chat messages.

1. Give me a summary of the most important subsystems of this project.
2. Tell me how a one-move Undo feature could be implemented using the existing game serialization, restart behavior, input manager, and HTML actuator. Explain which state must be restored and how invalid moves should behave.
3. Implement one-move Undo with an accessible Undo button and U keyboard shortcut. Restore the board, score, and terminal flags; preserve the best score; clear Undo on restart and refresh; and retain Undo after invalid moves. Do not introduce ternary operators. Keep changes on a feature branch.
4. What is missing? Check Undo after merges, no-op moves, game over, winning, restarting, and refreshing. Run meaningful automated checks and capture before, after-move, and after-Undo screenshots. Report limitations honestly.
