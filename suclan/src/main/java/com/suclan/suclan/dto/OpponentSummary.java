package com.suclan.suclan.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class OpponentSummary {
  Long opponentId;
  Long totalCount;
  Long win;
  Long lose;
}
